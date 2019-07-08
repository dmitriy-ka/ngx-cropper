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
  Renderer2
} from '@angular/core';
import { Subscription, fromEvent, Subject } from 'rxjs';
import { debounceTime, takeUntil, map, tap } from 'rxjs/operators';

@Component({
  selector: 'ngx-cropper',
  templateUrl: './ngx-cropper.component.html',
  styleUrls: ['./ngx-cropper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NgxCropperComponent implements OnInit, OnChanges, OnDestroy {
  private originalImage: any;
  private originalBase64: string;
  private ratio: number;
  private moveSubscription: Subscription;
  private stopMove$: Subject<boolean> = new Subject();
  private onDestroy$: Subject<any> = new Subject();

  @ViewChild('cropArea') cropArea: ElementRef;
  @ViewChild('cropImage') cropImage: ElementRef;
  @ViewChild('cropper') cropper: ElementRef;

  @Input() format: 'png' | 'jpeg' = 'png';
  @Input()
  set aspectRatio(value) {
    if (value < 10 || value > 10) {
      value = 1;
    }
    this.ratio = value;
  }

  get aspectRatio() {
    return this.ratio;
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
      this.initialize(file);
    }
  }

  imageSrc;
  showLoader = false;

  @HostListener('document:mouseup') clearListeners() {
    this.stopMove$.next(true);
  }

  constructor(private cdr: ChangeDetectorRef, private renderer: Renderer2) {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    console.log({ changes });
  }

  ngOnDestroy() {
    this.moveSubscription.unsubscribe();
    this.stopMove$.next();
    this.stopMove$.complete();
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  get image(): boolean {
    return this.originalImage;
  }

  private isFileValid(file) {
    return true;
  }

  private initialize(file: any) {
    this.showLoader = true;
    this.originalImage = file;

    const reader = new FileReader();
    reader.onload = (event: any) => {
      this.imageSrc = event.target.result;
      this.showLoader = false;
      this.cdr.markForCheck();
    };
    reader.readAsDataURL(file);
  }

  showCropArea() {}

  startMove(clickEvent, type: MoveType = 'move') {
    console.log('START MOVE', clickEvent);
    this.moveSubscription = fromEvent(document, 'mousemove')
      .pipe(
        debounceTime(50),
        takeUntil(this.stopMove$)
      )
      .subscribe((event: MouseEvent) => {
        this.moveCropper(clickEvent, event);
      });
  }

  private moveCropper(clickEvent: MouseEvent, moveEvent: MouseEvent) {
    const clickOffsetX = clickEvent.offsetX;
    const clickoffsetY = clickEvent.offsetY;

    const areaRect = this.getCroppAreaClientRect();
    const cropperRect = this.getCropperClientRect();

    const eventPageX = moveEvent.pageX;
    const eventPageY = moveEvent.pageY;
    const eventLeftMin = areaRect.left + clickOffsetX;
    const eventLeftMax = areaRect.right - clickOffsetX;
    const eventTopMin = areaRect.top + clickoffsetY;
    const eventTopMax = areaRect.bottom - clickoffsetY;

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
    this.setCropperPosition(left, top);
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

  private getCroppAreaClientRect(): ClientRect {
    return (this.cropArea.nativeElement as HTMLElement).getBoundingClientRect();
  }

  private getCropperClientRect(): ClientRect {
    return (this.cropper.nativeElement as HTMLElement).getBoundingClientRect();
  }
  noop(event?) {
    return false;
  }

  private clear() {
    this.imageSrc = null;
    this.originalImage = null;
  }
}

export type MoveType = 'move' | 'resize';
