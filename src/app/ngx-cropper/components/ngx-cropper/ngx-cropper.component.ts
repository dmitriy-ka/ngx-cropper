import {
  Component,
  OnInit,
  Input,
  SimpleChanges,
  OnChanges,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  HostListener,
  OnDestroy,
  Renderer2,
  NgZone,
  Output,
  EventEmitter
} from '@angular/core';
import { Subscription, fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'ngx-cropper',
  templateUrl: './ngx-cropper.component.html',
  styleUrls: ['./ngx-cropper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NgxCropperComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('cropArea') cropArea: ElementRef;
  @ViewChild('cropImage') cropImage: ElementRef;
  @ViewChild('cropper') cropper: ElementRef;
  @ViewChild('cropperDragElement') cropperDragElement: ElementRef;

  @Input() format: 'png' | 'jpeg' = 'png';
  @Input() downloadFileName = 'image';
  @Input()
  set quality(value) {
    value = isNaN(Number(value)) ? 0.1 : value;
    if (value < 0) {
      this._quality = 0;
    } else if (value > 1) {
      this._quality = 1;
    } else {
      this._quality = Number(value);
    }
  }
  get quality() {
    return this._quality;
  }
  @Input()
  set aspectRatio(value) {
    if (value < 10 || value > 10) {
      value = 1;
    }
    this._ratio = value;
  }
  get aspectRatio() {
    return this._ratio;
  }

  @Input()
  set fileChangedEvent(event: Event) {
    const eventTarget: Partial<HTMLInputElement> = event ? event.target : null;
    if (eventTarget && eventTarget.files && eventTarget.files.length > 0) {
      const file = eventTarget.files[0];
      if (!this.isFileValid(file)) {
        // TODO:
        return;
      }
      this.initCropper(file);
    }
  }

  @Output() imageCropped = new EventEmitter();

  private originalImage: HTMLImageElement;
  private originalSize: Dimensions = {
    width: 0,
    height: 0
  };
  private originalBase64: any;
  private canvas: HTMLCanvasElement;
  private _ratio: number;
  private _quality: number;

  private dragging$: Subscription;
  private stopMove$: Subject<boolean> = new Subject();
  private onDestroy$: Subject<any> = new Subject();

  showLoader = false;

  @HostListener('document:mouseup') clearListeners(event) {
    this.stopMove$.next(true);
  }

  get imageSrc(): string {
    if (this.originalImage) {
      return this.originalImage.src;
    }
  }

  constructor(
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.stopMove$.pipe(takeUntil(this.onDestroy$)).subscribe(res => {
      if (this.dragging$) {
        this.crop();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {}

  ngOnDestroy() {
    this.dragging$.unsubscribe();
    this.stopMove$.next();
    this.stopMove$.complete();
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  dragCropper(clickEvent, type: MoveType = 'move') {
    if (clickEvent.srcElement !== this.cropperDragElement.nativeElement) {
      return;
    }
    this.dragging$ = fromEvent(document, 'mousemove')
      .pipe(takeUntil(this.stopMove$))
      .subscribe((event: MouseEvent) => {
        this.moveCropper(clickEvent, event);
      });
  }

  crop() {
    this.ngZone.runOutsideAngular(() => {
      const {
        offsetLeft,
        offsetTop,
        offsetWidth,
        offsetHeight
      } = this.cropper.nativeElement;

      // Ratio between original image size and cropArea size
      const ratio =
        this.originalSize.width / this.cropArea.nativeElement.clientWidth;

      const canvas = document.createElement('canvas');
      canvas.width = offsetWidth * ratio;
      canvas.height = offsetHeight * ratio;

      canvas
        .getContext('2d')
        .drawImage(
          this.originalImage,
          offsetLeft * ratio,
          offsetTop * ratio,
          offsetWidth * ratio,
          offsetHeight * ratio,
          0,
          0,
          canvas.width,
          canvas.height
        );

      this.ngZone.run(() => {
        this.canvas = canvas;
        this.imageCropped.emit(canvas.toDataURL('image/png', this.quality));
      });
    });
  }

  downloadImage() {
    const link = document.createElement('a');
    link.href = this.canvas.toDataURL();
    link.download = `${this.downloadFileName}.${this.format}`;
    link.click();
  }

  noop(event?: MouseEvent) {
    return false;
  }

  private isFileValid(file) {
    return true;
  }

  private initCropper(file: any) {
    this.showLoader = true;

    const reader = new FileReader();
    reader.onload = (event: ProgressEvent) => {
      this.showLoader = false;
      this.cdr.markForCheck();
      this.onLoadImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  private onLoadImage(imageBase64: string) {
    this.originalBase64 = imageBase64;

    this.originalImage = new Image();
    this.originalImage.onload = () => {
      this.originalSize.width = this.originalImage.width;
      this.originalSize.height = this.originalImage.height;
      this.crop();
      this.cdr.markForCheck();
    };
    this.originalImage.src = imageBase64;
  }

  private moveCropper(clickEvent: MouseEvent, moveEvent: MouseEvent) {
    this.ngZone.runOutsideAngular(() => {
      const clickOffsetX = clickEvent.offsetX;
      const clickoffsetY = clickEvent.offsetY;

      const areaRect = (this.cropArea
        .nativeElement as HTMLElement).getBoundingClientRect();
      const cropperRect = (this.cropper
        .nativeElement as HTMLElement).getBoundingClientRect();

      const eventPageX = moveEvent.pageX;
      const eventPageY = moveEvent.pageY;
      const eventLeftMin = areaRect.left + clickOffsetX;
      const eventLeftMax = areaRect.right - clickOffsetX;
      const eventTopMin = areaRect.top + clickoffsetY;
      const eventTopMax = areaRect.bottom - clickoffsetY;

      // TODO: calc with scroll height

      let left, top;
      if (eventPageX <= eventLeftMin) {
        left = 0;
      } else if (eventPageX >= eventLeftMax) {
        left = areaRect.width - cropperRect.width;
      } else {
        left = eventPageX - areaRect.left - clickOffsetX;
      }
      if (eventPageY <= eventTopMin) {
        top = 0;
      } else if (eventPageY >= eventTopMax) {
        top = areaRect.height - cropperRect.height;
      } else {
        top = eventPageY - areaRect.top - clickoffsetY;
      }
      this.ngZone.run(() => {
        this.setCropperPosition(left, top);
      });
    });
  }

  private setCropperPosition(left: number, top: number): void {
    this.renderer.setStyle(
      this.cropper.nativeElement,
      'margin-left',
      `initial`
    );
    this.renderer.setStyle(this.cropper.nativeElement, 'margin-top', `initial`);
    this.renderer.setStyle(this.cropper.nativeElement, 'left', `${left}px`);
    this.renderer.setStyle(this.cropper.nativeElement, 'top', `${top}px`);
  }
}

export type MoveType = 'move' | 'resize';

export interface Dimensions {
  width: number;
  height: number;
}
