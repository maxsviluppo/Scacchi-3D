
import { Component, ElementRef, ViewChild, AfterViewInit, inject, effect, OnDestroy, signal } from '@angular/core';
import { GameService } from '../services/game.service';
import { Position, Piece, PieceType } from '../logic/chess-types';

@Component({
  selector: 'app-chess-scene',
  template: `
    <div class="relative w-full h-full">
      <canvas #canvas class="block w-full h-full outline-none"></canvas>
      @if (loading) {
        <div class="absolute inset-0 flex items-center justify-center bg-slate-900 text-blue-200 font-mono z-10">
          <div class="flex flex-col items-center gap-4">
            <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Caricamento Studio 3D...</span>
          </div>
        </div>
      }
    </div>
  `,
  standalone: true
})
export class ChessSceneComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  gameService = inject(GameService);
  loading = true;

  private three: any; 
  private stlLoader: any; 
  private gltfLoader: any;
  private scene: any;
  private camera: any;
  private renderer: any;
  private controls: any;
  private piecesGroup: any;
  private boardGroup: any; 
  private highlightsGroup: any;
  private raycaster: any;
  private mouse: any;
  private animationId: number = 0;

  // Custom Model Cache: Stores { geometry, material? }
  private customCache: Map<string, any> = new Map();
  private customBoardGeometry: any = null;

  constructor() {
    effect(() => {
      const board = this.gameService.board();
      const validMoves = this.gameService.validMoves();
      const selected = this.gameService.selectedPos();
      const style = this.gameService.pieceStyle(); 
      const useOriginal = this.gameService.useOriginalTexture(); // trigger update on toggle
      
      if (this.three && this.scene) {
        this.updatePieces(board, selected, style);
        this.updateHighlights(validMoves, selected);
      }
    });
  }

  async ngAfterViewInit() {
    await this.initThree();
    this.loading = false;
  }

  async loadCustomModel(file: File, key: string) {
    if (!this.three) return;

    const url = URL.createObjectURL(file);
    const fileName = file.name.toLowerCase();
    
    try {
      let result: any = null;

      if (fileName.endsWith('.stl')) {
        const geo = await this.loadSTL(url);
        result = { geometry: geo, material: null };
      } else if (fileName.endsWith('.glb') || fileName.endsWith('.gltf')) {
        result = await this.loadGLTF(url);
      }

      if (!result || !result.geometry) throw new Error("No geometry found");

      const geometry = result.geometry;

      // --- 1. Center & Measure ---
      geometry.center();
      geometry.computeBoundingBox();
      let size = new this.three.Vector3();
      geometry.boundingBox!.getSize(size);

      // --- 2. Auto-Orientation (Axis Correction) ---
      if (key !== 'board') {
        // Step A: Ensure Verticality (Z-up vs Y-up)
        if (size.z > size.y * 1.2 && size.z > size.x) {
            geometry.rotateX(-Math.PI / 2); 
        } else if (size.x > size.y * 1.2 && size.x > size.z) {
             geometry.rotateZ(-Math.PI / 2); 
        }

        // Re-measure after rotation
        geometry.computeBoundingBox();
        geometry.center(); 
        
        // Step B: Ensure "Base Down" (Fix Upside Down)
        const positions = geometry.attributes.position.array;
        const box = geometry.boundingBox!;
        const height = box.max.y - box.min.y;
        const bottomThreshold = box.min.y + (height * 0.2);
        const topThreshold = box.max.y - (height * 0.2);

        let maxRadiusBottom = 0;
        let maxRadiusTop = 0;

        for (let i = 0; i < positions.length; i += 3) {
          const x = positions[i];
          const y = positions[i+1];
          const z = positions[i+2];
          const radiusSq = x*x + z*z;

          if (y < bottomThreshold) {
            maxRadiusBottom = Math.max(maxRadiusBottom, radiusSq);
          } else if (y > topThreshold) {
            maxRadiusTop = Math.max(maxRadiusTop, radiusSq);
          }
        }

        if (maxRadiusTop > maxRadiusBottom * 1.2) {
           geometry.rotateX(Math.PI); // Flip 180 degrees
           geometry.center(); // Re-center
        }

        // Step C: Rotate 90 degrees for Knights (Request: "ruota 90 gradi" during import fix)
        // Keep this import rotation as is, we handle the 180 flip in updatePieces
        if (key.includes('n')) {
             geometry.rotateY(-Math.PI / 2);
             geometry.computeBoundingBox();
             geometry.center();
        }
      }

      // --- 3. Final Scaling & Positioning ---
      geometry.computeBoundingBox();
      const finalBox = geometry.boundingBox!;
      const finalSize = new this.three.Vector3();
      finalBox.getSize(finalSize);

      if (key === 'board') {
         const maxDim = Math.max(finalSize.x, finalSize.z);
         const targetSize = 12.0;
         const scaleFactor = targetSize / maxDim;
         geometry.scale(scaleFactor, scaleFactor, scaleFactor);
         
         geometry.computeBoundingBox();
         const newBox = geometry.boundingBox!;
         const offset = -0.05 - newBox.max.y;
         geometry.translate(0, offset, 0);
         geometry.computeVertexNormals();
         this.customBoardGeometry = geometry;
         this.createBoard();

      } else {
         const maxBaseDim = Math.max(finalSize.x, finalSize.z);
         const targetSize = 0.70; 
         let scaleFactor = targetSize / maxBaseDim;
         
         geometry.scale(scaleFactor, scaleFactor, scaleFactor);
         geometry.computeBoundingBox();
         const newBox = geometry.boundingBox!;
         
         // Sit exactly on floor (Y=0)
         const lift = -newBox.min.y;
         geometry.translate(0, lift, 0);
         geometry.computeVertexNormals(); 
         
         this.customCache.set(key, { geometry, material: result.material });

         if (this.gameService.pieceStyle() === 'custom') {
            this.gameService.setPieceStyle('custom'); 
            this.updatePieces(this.gameService.board(), this.gameService.selectedPos(), 'custom');
         }
      }

    } catch (e) {
      console.error('Failed to load Model', e);
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  private loadSTL(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.stlLoader.load(url, (geo: any) => resolve(geo), undefined, reject);
    });
  }

  private loadGLTF(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(url, (gltf: any) => {
        let foundGeometry: any = null;
        let foundMaterial: any = null;

        gltf.scene.traverse((child: any) => {
          if (!foundGeometry && child.isMesh) {
            foundGeometry = child.geometry.clone();
            // Clone material to keep textures
            if (child.material) {
                foundMaterial = child.material.clone();
            }
          }
        });
        if (foundGeometry) resolve({ geometry: foundGeometry, material: foundMaterial });
        else reject('No mesh found in GLTF');
      }, undefined, reject);
    });
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animationId);
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  private async initThree() {
    this.three = await import('three');
    const OrbitControls = await import('three-orbit-controls');
    const { STLLoader } = await import('three/examples/jsm/loaders/STLLoader');
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader');
    
    this.stlLoader = new STLLoader();
    this.gltfLoader = new GLTFLoader();

    const width = this.canvasRef.nativeElement.clientWidth;
    const height = this.canvasRef.nativeElement.clientHeight;

    this.scene = new this.three.Scene();
    this.scene.background = null; 

    this.camera = new this.three.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 10, 10); 

    this.renderer = new this.three.WebGLRenderer({ 
      canvas: this.canvasRef.nativeElement, 
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = this.three.PCFSoftShadowMap;
    this.renderer.toneMapping = this.three.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    this.controls = new OrbitControls.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2.1; 
    this.controls.minDistance = 4;
    this.controls.maxDistance = 20;

    // --- LIGHTING SETUP ---
    const ambientLight = new this.three.AmbientLight(0xffffff, 0.25); 
    this.scene.add(ambientLight);

    const dirLight = new this.three.DirectionalLight(0xfff0dd, 2.5); 
    dirLight.position.set(5, 12, 5); 
    dirLight.castShadow = true;
    
    const d = 8;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.mapSize.width = 4096;
    dirLight.shadow.mapSize.height = 4096;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 50;
    dirLight.shadow.bias = -0.0005; 
    dirLight.shadow.normalBias = 0.02; 
    dirLight.shadow.radius = 2; 
    
    this.scene.add(dirLight);

    const fillLight = new this.three.DirectionalLight(0xb0c4de, 1.2);
    fillLight.position.set(-5, 8, -5);
    this.scene.add(fillLight);

    const rimLight = new this.three.SpotLight(0x60a5fa, 2.0);
    rimLight.position.set(0, 2, -10);
    rimLight.lookAt(0, 0, 0);
    this.scene.add(rimLight);

    this.boardGroup = new this.three.Group();
    this.scene.add(this.boardGroup);

    this.createBoard();

    this.piecesGroup = new this.three.Group();
    this.scene.add(this.piecesGroup);
    
    this.highlightsGroup = new this.three.Group();
    this.scene.add(this.highlightsGroup);

    this.raycaster = new this.three.Raycaster();
    this.mouse = new this.three.Vector2();

    this.canvasRef.nativeElement.addEventListener('click', (e) => this.onCanvasClick(e));
    
    this.updatePieces(this.gameService.board(), this.gameService.selectedPos(), this.gameService.pieceStyle());

    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    };
    animate();
    
    window.addEventListener('resize', () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });
  }

  private createPieceMaterial(colorHex: number, isSelected: boolean): any {
     return new this.three.MeshPhysicalMaterial({
        color: colorHex,
        roughness: 0.25,  
        metalness: 0.15,  
        clearcoat: 1.0,   
        clearcoatRoughness: 0.15,
        emissive: isSelected ? 0xffd700 : 0x000000,
        emissiveIntensity: isSelected ? 0.4 : 0
     });
  }

  private createBoard() {
    if (!this.three || !this.boardGroup) return;
    this.boardGroup.clear();

    if (this.customBoardGeometry) {
      const mat = new this.three.MeshStandardMaterial({ color: 0x888888, roughness: 0.4, metalness: 0.3 });
      const mesh = new this.three.Mesh(this.customBoardGeometry, mat);
      mesh.receiveShadow = true;
      mesh.castShadow = true;
      this.boardGroup.add(mesh);
      
      const geo = new this.three.BoxGeometry(1, 0.2, 1);
      const hitboxMat = new this.three.MeshBasicMaterial({ visible: false }); 
      for (let x = 0; x < 8; x++) {
        for (let z = 0; z < 8; z++) {
          const square = new this.three.Mesh(geo, hitboxMat);
          square.position.set(x - 3.5, 0, z - 3.5);
          square.userData = { isSquare: true, row: z, col: x };
          this.boardGroup.add(square);
        }
      }
    } else {
      const geo = new this.three.BoxGeometry(1, 0.2, 1);
      const darkMat = new this.three.MeshPhysicalMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.1, clearcoat: 0.2 });
      const lightMat = new this.three.MeshPhysicalMaterial({ color: 0xf1f5f9, roughness: 0.4, metalness: 0.1, clearcoat: 0.2 });

      for (let x = 0; x < 8; x++) {
        for (let z = 0; z < 8; z++) {
          const isWhite = (x + z) % 2 === 0;
          const square = new this.three.Mesh(geo, isWhite ? lightMat : darkMat);
          square.position.set(x - 3.5, 0, z - 3.5);
          square.receiveShadow = true;
          square.userData = { isSquare: true, row: z, col: x };
          this.boardGroup.add(square);
        }
      }
      const borderGeo = new this.three.BoxGeometry(8.6, 0.3, 8.6);
      const borderMat = new this.three.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 });
      const border = new this.three.Mesh(borderGeo, borderMat);
      border.position.y = -0.15;
      border.receiveShadow = true;
      this.boardGroup.add(border);
    }
  }

  private updatePieces(board: any[][], selected: Position | null, style: string) {
    if (!this.three) return;
    this.piecesGroup.clear();

    board.forEach((row, r) => {
      row.forEach((piece, c) => {
        if (piece) {
          const isSelected = selected && selected.row === r && selected.col === c;
          let mesh;
          
          if (piece.type === 'cm' || piece.type === 'ck') {
             mesh = this.createCheckersPiece(piece, isSelected, style);
          } else {
             if (style === 'classic') {
                mesh = this.createClassicPiece(piece, isSelected);
             } else if (style === 'neon') {
                mesh = this.createNeonPiece(piece, isSelected);
             } else if (style === 'custom') {
                mesh = this.createCustomPiece(piece, isSelected);
             } else {
                mesh = this.createMinimalPiece(piece, isSelected);
             }
          }
          
          mesh.position.set(c - 3.5, 0.1, r - 3.5);
          
          if (mesh.type === 'Group') {
             mesh.children.forEach((child: any) => {
                child.userData = { isPiece: true, row: r, col: c };
             });
          } else {
             mesh.userData = { isPiece: true, row: r, col: c };
          }
          
          this.piecesGroup.add(mesh);
        }
      });
    });
  }

  // --- STYLE: CUSTOM ---
  private createCustomPiece(piece: Piece, isSelected: boolean): any {
    const colorKey = `${piece.type}_${piece.color}`;
    let cached = this.customCache.get(colorKey);

    if (!cached) {
        cached = this.customCache.get(piece.type);
    }

    if (cached) {
        // Material Selection
        let material;
        if (this.gameService.useOriginalTexture() && cached.material) {
             material = cached.material;
             // Ensure emissivity for selection works on original material if possible
             if (isSelected && material.emissive) {
                // Cloning is expensive but necessary to not affect other pieces
                material = material.clone();
                material.emissive.setHex(0xffd700);
                material.emissiveIntensity = 0.4;
             }
        } else {
             const color = piece.color === 'w' ? 0xffffff : 0x222222;
             material = this.createPieceMaterial(color, isSelected);
        }

        const mesh = new this.three.Mesh(cached.geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // Dynamic Rotation: Ensure Knights face opponents
        // PREVIOUS LOGIC (Inverted as per request):
        // White (at +Z) was facing -Z (Math.PI) -> NOW faces +Z (0)
        // Black (at -Z) was facing +Z (0) -> NOW faces -Z (Math.PI)
        if (piece.type === 'n') {
           mesh.rotation.y = piece.color === 'w' ? 0 : Math.PI;
        }

        return mesh;
    } else {
        if (piece.type === 'cm' || piece.type === 'ck') {
            return this.createCheckersPiece(piece, isSelected, 'minimal');
        }
        return this.createMinimalPiece(piece, isSelected);
    }
  }

  // --- CHECKERS DEFAULT ---
  private createCheckersPiece(piece: Piece, isSelected: boolean, style: string): any {
      const color = piece.color === 'w' ? 0xfdf6e3 : 0x1a1a1a; 
      const material = this.createPieceMaterial(color, isSelected);

      const group = new this.three.Group();
      const geo = new this.three.CylinderGeometry(0.35, 0.35, 0.15, 32);
      geo.translate(0, 0.075, 0);
      const mesh = new this.three.Mesh(geo, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);

      if (piece.type === 'ck') {
          const crownGeo = new this.three.CylinderGeometry(0.35, 0.35, 0.15, 32);
          crownGeo.translate(0, 0.225, 0); 
          const crown = new this.three.Mesh(crownGeo, material);
          crown.castShadow = true;
          crown.receiveShadow = true;
          group.add(crown);
          
          const ring = new this.three.Mesh(
              new this.three.TorusGeometry(0.2, 0.02, 16, 32),
              new this.three.MeshBasicMaterial({ color: 0xffd700 })
          );
          ring.rotation.x = Math.PI / 2;
          ring.position.y = 0.31;
          group.add(ring);
      } else {
          const inner = new this.three.Mesh(
              new this.three.CylinderGeometry(0.25, 0.25, 0.16, 32),
              material
          );
          inner.translate(0, 0.075, 0);
          group.add(inner);
      }
      return group;
  }

  // --- STYLE: MINIMAL ---
  private createMinimalPiece(piece: Piece, isSelected: boolean): any {
    const color = piece.color === 'w' ? 0xffffff : 0x1e293b;
    const material = this.createPieceMaterial(color, isSelected);

    let geometry;
    switch(piece.type) {
        case 'p': geometry = new this.three.CylinderGeometry(0.25, 0.25, 0.6, 32); break;
        case 'r': geometry = new this.three.BoxGeometry(0.55, 0.8, 0.55); break;
        case 'n': geometry = new this.three.CylinderGeometry(0.3, 0.4, 0.9, 4); break;
        case 'b': geometry = new this.three.ConeGeometry(0.3, 1.0, 32); break;
        case 'q': geometry = new this.three.CylinderGeometry(0.35, 0.2, 1.4, 32); break;
        case 'k': geometry = new this.three.CylinderGeometry(0.4, 0.3, 1.6, 8); break;
        default: geometry = new this.three.SphereGeometry(0.3);
    }
    geometry.translate(0, 0.3, 0);
    const mesh = new this.three.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  // --- STYLE: NEON ---
  private createNeonPiece(piece: Piece, isSelected: boolean): any {
    const color = piece.color === 'w' ? 0x00ffff : 0xff00ff; 
    const material = new this.three.MeshBasicMaterial({ 
      color: isSelected ? 0xffff00 : color,
      wireframe: true,
    });

    let geometry;
    switch(piece.type) {
        case 'p': geometry = new this.three.OctahedronGeometry(0.3); break;
        case 'r': geometry = new this.three.BoxGeometry(0.5, 0.8, 0.5); break;
        case 'n': geometry = new this.three.IcosahedronGeometry(0.4); break;
        case 'b': geometry = new this.three.ConeGeometry(0.3, 1.1, 4); break;
        case 'q': geometry = new this.three.TorusKnotGeometry(0.25, 0.1, 64, 8); break;
        case 'k': geometry = new this.three.CylinderGeometry(0.4, 0.0, 1.5, 4); break;
        default: geometry = new this.three.SphereGeometry(0.3);
    }
    geometry.translate(0, 0.4, 0);
    return new this.three.Mesh(geometry, material);
  }

  // --- STYLE: CLASSIC ---
  private createClassicPiece(piece: Piece, isSelected: boolean): any {
     const color = piece.color === 'w' ? 0xfdf6e3 : 0x1a1a1a; 
     const material = this.createPieceMaterial(color, isSelected);

     const group = new this.three.Group();
     
     const baseGeo = new this.three.CylinderGeometry(0.38, 0.42, 0.15, 32);
     baseGeo.translate(0, 0.075, 0);
     const base = new this.three.Mesh(baseGeo, material);
     group.add(base);

     if (piece.type === 'p') {
         const bodyLow = new this.three.Mesh(new this.three.CylinderGeometry(0.15, 0.35, 0.4, 32), material);
         bodyLow.position.y = 0.35;
         const bodyHigh = new this.three.Mesh(new this.three.CylinderGeometry(0.12, 0.15, 0.3, 32), material);
         bodyHigh.position.y = 0.65;
         const collar = new this.three.Mesh(new this.three.CylinderGeometry(0.2, 0.2, 0.05, 32), material);
         collar.position.y = 0.8;
         const head = new this.three.Mesh(new this.three.SphereGeometry(0.2, 32, 16), material);
         head.position.y = 0.95;
         group.add(bodyLow, bodyHigh, collar, head);
     } else if (piece.type === 'r') {
         const body = new this.three.Mesh(new this.three.CylinderGeometry(0.25, 0.3, 0.6, 32), material);
         body.position.y = 0.4;
         const head = new this.three.Mesh(new this.three.CylinderGeometry(0.32, 0.32, 0.25, 32), material);
         head.position.y = 0.8;
         group.add(body, head);
     } else if (piece.type === 'n') {
         const body = new this.three.Mesh(new this.three.CylinderGeometry(0.2, 0.3, 0.5, 32), material);
         body.position.y = 0.35;
         const headGeo = new this.three.BoxGeometry(0.25, 0.45, 0.55); 
         headGeo.translate(0, 0.2, 0.1); 
         const head = new this.three.Mesh(headGeo, material);
         head.position.y = 0.55;
         head.rotation.x = -0.2;
         group.add(body, head);
         
         // Fix: Rotate to face Opponents (Forward) instead of Backwards
         // White (at +Z) needs to look at -Z (Math.PI)
         // Black (at -Z) needs to look at +Z (0)
         group.rotation.y = piece.color === 'w' ? Math.PI : 0;

     } else if (piece.type === 'b') {
         const body = new this.three.Mesh(new this.three.CylinderGeometry(0.1, 0.25, 0.8, 32), material);
         body.position.y = 0.5;
         const collar = new this.three.Mesh(new this.three.CylinderGeometry(0.2, 0.2, 0.05, 32), material);
         collar.position.y = 0.85;
         const head = new this.three.Mesh(new this.three.SphereGeometry(0.15), material);
         head.position.y = 1.0;
         group.add(body, collar, head);
     } else if (piece.type === 'q') {
         const body = new this.three.Mesh(new this.three.CylinderGeometry(0.15, 0.3, 1.0, 32), material);
         body.position.y = 0.6;
         const crown = new this.three.Mesh(new this.three.SphereGeometry(0.25), material);
         crown.position.y = 1.15;
         const top = new this.three.Mesh(new this.three.SphereGeometry(0.1), material);
         top.position.y = 1.4;
         group.add(body, crown, top);
     } else if (piece.type === 'k') {
         const body = new this.three.Mesh(new this.three.CylinderGeometry(0.2, 0.3, 1.1, 32), material);
         body.position.y = 0.65;
         const vGeo = new this.three.BoxGeometry(0.1, 0.3, 0.1);
         const hGeo = new this.three.BoxGeometry(0.25, 0.1, 0.1);
         const vMesh = new this.three.Mesh(vGeo, material);
         const hMesh = new this.three.Mesh(hGeo, material);
         vMesh.position.y = 1.35;
         hMesh.position.y = 1.35;
         group.add(body, vMesh, hMesh);
     }

     group.traverse((obj: any) => {
         if (obj.isMesh) {
             obj.castShadow = true;
             obj.receiveShadow = true;
         }
     });

     return group;
  }

  private updateHighlights(moves: Position[], selected: Position | null) {
    if (!this.three) return;
    this.highlightsGroup.clear();

    if (selected) {
        const selGeo = new this.three.PlaneGeometry(0.9, 0.9);
        selGeo.rotateX(-Math.PI / 2);
        const selMat = new this.three.MeshBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.4, side: this.three.DoubleSide });
        const selMesh = new this.three.Mesh(selGeo, selMat);
        selMesh.position.set(selected.col - 3.5, 0.11, selected.row - 3.5);
        this.highlightsGroup.add(selMesh);
    }

    const moveGeo = new this.three.RingGeometry(0.2, 0.35, 32); 
    moveGeo.rotateX(-Math.PI / 2);
    const moveMat = new this.three.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.6, side: this.three.DoubleSide });

    moves.forEach(m => {
        const mesh = new this.three.Mesh(moveGeo, moveMat);
        mesh.position.set(m.col - 3.5, 0.11, m.row - 3.5);
        this.highlightsGroup.add(mesh);
    });
  }

  private onCanvasClick(event: MouseEvent) {
    if (!this.camera || !this.scene || !this.three) return;

    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(this.scene.children, true);
    
    for (const intersect of intersects) {
        const data = intersect.object.userData;
        if (data && (data.isSquare || data.isPiece)) {
            this.gameService.selectSquare({ row: data.row, col: data.col });
            break; 
        }
    }
  }
}
