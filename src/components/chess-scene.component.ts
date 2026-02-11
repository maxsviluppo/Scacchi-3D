
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

  // Custom Geometry Cache: keys can be 'k' (generic) or 'k_w' (white king), 'k_b' (black king)
  private customGeometries: Map<string, any> = new Map();
  private customBoardGeometry: any = null;

  constructor() {
    effect(() => {
      const board = this.gameService.board();
      const validMoves = this.gameService.validMoves();
      const selected = this.gameService.selectedPos();
      const style = this.gameService.pieceStyle(); 
      
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

  /**
   * key can be:
   *  - 'p', 'r'... (generic piece)
   *  - 'p_w', 'p_b'... (specific colored piece)
   *  - 'board'
   */
  async loadCustomModel(file: File, key: string) {
    if (!this.three) return;

    const url = URL.createObjectURL(file);
    const fileName = file.name.toLowerCase();
    
    try {
      let geometry: any = null;

      if (fileName.endsWith('.stl')) {
        geometry = await this.loadSTL(url);
        geometry.rotateX(-Math.PI / 2); 
      } else if (fileName.endsWith('.glb') || fileName.endsWith('.gltf')) {
        geometry = await this.loadGLTF(url);
      }

      if (!geometry) throw new Error("No geometry found");

      // --- Geometry Normalization ---
      geometry.center();
      geometry.computeBoundingBox();
      const box = geometry.boundingBox;
      const size = new this.three.Vector3();
      box.getSize(size);

      if (key === 'board') {
         const maxDim = Math.max(size.x, size.z);
         const targetSize = 12.0;
         const scaleFactor = targetSize / maxDim;
         geometry.scale(scaleFactor, scaleFactor, scaleFactor);
         
         geometry.computeBoundingBox();
         const newBox = geometry.boundingBox;
         const offset = -0.05 - newBox.max.y;
         geometry.translate(0, offset, 0);
         geometry.computeVertexNormals();
         
         this.customBoardGeometry = geometry;
         this.createBoard();

      } else {
         // Piece
         const maxBaseDim = Math.max(size.x, size.z);
         const targetSize = 0.75; 
         let scaleFactor = targetSize / maxBaseDim;
         
         geometry.scale(scaleFactor, scaleFactor, scaleFactor);
         geometry.computeBoundingBox();
         const newBox = geometry.boundingBox;
         const lift = -newBox.min.y;
         geometry.translate(0, lift, 0);
         geometry.computeVertexNormals(); 
         
         this.customGeometries.set(key, geometry);

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
        gltf.scene.traverse((child: any) => {
          if (!foundGeometry && child.isMesh) {
            foundGeometry = child.geometry.clone(); 
          }
        });
        if (foundGeometry) resolve(foundGeometry);
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
    this.scene.background = new this.three.Color(0x283044); 
    this.scene.fog = new this.three.FogExp2(0x283044, 0.02);

    this.camera = new this.three.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 12, 12);

    this.renderer = new this.three.WebGLRenderer({ 
      canvas: this.canvasRef.nativeElement, 
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = this.three.PCFSoftShadowMap; 
    this.renderer.toneMapping = this.three.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    this.controls = new OrbitControls.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2.2; 
    this.controls.minDistance = 5;
    this.controls.maxDistance = 20;

    const ambientLight = new this.three.AmbientLight(0xffffff, 0.6); 
    this.scene.add(ambientLight);

    const dirLight = new this.three.DirectionalLight(0xffffff, 1.8);
    dirLight.position.set(5, 12, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.bias = -0.0005;
    this.scene.add(dirLight);

    const fillLight = new this.three.DirectionalLight(0xb0c4de, 0.5);
    fillLight.position.set(-5, 8, -5);
    this.scene.add(fillLight);

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
      const hitboxMat = new this.three.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0, depthWrite: false });

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
      const darkMat = new this.three.MeshStandardMaterial({ color: 0x475569, roughness: 0.3, metalness: 0.2 });
      const lightMat = new this.three.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3, metalness: 0.2 });

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
      const borderMat = new this.three.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.1 });
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
             // Chess Pieces
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
    // 1. Check for Specific Color Model (e.g. 'k_w' or 'k_b')
    const colorKey = `${piece.type}_${piece.color}`;
    let customGeo = this.customGeometries.get(colorKey);

    // 2. Fallback to Generic Model (e.g. 'k')
    if (!customGeo) {
        customGeo = this.customGeometries.get(piece.type);
    }

    if (customGeo) {
        // Use generic material colors, unless user textured it (we assume material color override for now)
        const color = piece.color === 'w' ? 0xffffff : 0x222222;
        const material = new this.three.MeshStandardMaterial({ 
          color: color, 
          roughness: 0.3, 
          metalness: 0.3,
          emissive: isSelected ? 0xffd700 : 0x000000,
          emissiveIntensity: isSelected ? 0.4 : 0
        });
        const mesh = new this.three.Mesh(customGeo, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
    } else {
        // If it's a checker piece but no custom model, use default
        if (piece.type === 'cm' || piece.type === 'ck') {
            return this.createCheckersPiece(piece, isSelected, 'minimal');
        }
        return this.createMinimalPiece(piece, isSelected);
    }
  }

  // --- CHECKERS DEFAULT ---
  private createCheckersPiece(piece: Piece, isSelected: boolean, style: string): any {
      const color = piece.color === 'w' ? 0xfdf6e3 : 0x1a1a1a; 
      const material = new this.three.MeshStandardMaterial({ 
        color: color, 
        roughness: 0.2, 
        metalness: 0.1,
        emissive: isSelected ? 0xffd700 : 0x000000,
        emissiveIntensity: isSelected ? 0.3 : 0
      });

      const group = new this.three.Group();
      // Base Checker
      const geo = new this.three.CylinderGeometry(0.35, 0.35, 0.15, 32);
      geo.translate(0, 0.075, 0);
      const mesh = new this.three.Mesh(geo, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);

      // King Mark (Another checker on top or a crown)
      if (piece.type === 'ck') {
          const crownGeo = new this.three.CylinderGeometry(0.35, 0.35, 0.15, 32);
          crownGeo.translate(0, 0.225, 0); // Sit on top
          const crown = new this.three.Mesh(crownGeo, material);
          crown.castShadow = true;
          crown.receiveShadow = true;
          group.add(crown);
          
          // Gold ring to distinguish
          const ring = new this.three.Mesh(
              new this.three.TorusGeometry(0.2, 0.02, 16, 32),
              new this.three.MeshBasicMaterial({ color: 0xffd700 })
          );
          ring.rotation.x = Math.PI / 2;
          ring.position.y = 0.31;
          group.add(ring);
      } else {
          // Inner detail for man
          const inner = new this.three.Mesh(
              new this.three.CylinderGeometry(0.25, 0.25, 0.16, 32),
              new this.three.MeshStandardMaterial({ color: color, roughness: 0.5 })
          );
          inner.translate(0, 0.075, 0);
          group.add(inner);
      }
      return group;
  }

  // --- STYLE: MINIMAL ---
  private createMinimalPiece(piece: Piece, isSelected: boolean): any {
    const color = piece.color === 'w' ? 0xffffff : 0x1e293b;
    const material = new this.three.MeshStandardMaterial({ 
      color: color, 
      roughness: 0.2, 
      metalness: 0.5,
      emissive: isSelected ? 0xffd700 : 0x000000,
      emissiveIntensity: isSelected ? 0.5 : 0
    });

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

  // --- STYLE: CLASSIC (Composite) ---
  private createClassicPiece(piece: Piece, isSelected: boolean): any {
     const color = piece.color === 'w' ? 0xfdf6e3 : 0x1a1a1a; 
     const material = new this.three.MeshStandardMaterial({
        color: color,
        roughness: 0.3, 
        metalness: 0.1,
        emissive: isSelected ? 0xffd700 : 0x000000,
        emissiveIntensity: isSelected ? 0.3 : 0
     });

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
         group.rotation.y = piece.color === 'w' ? 0 : Math.PI;
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
