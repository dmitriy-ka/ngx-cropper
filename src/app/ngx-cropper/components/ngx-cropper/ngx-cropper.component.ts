import {
  Component,
  OnInit,
  Input,
  SimpleChanges,
  OnChanges,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';

@Component({
  selector: 'ngx-cropper',
  templateUrl: './ngx-cropper.component.html',
  styleUrls: ['./ngx-cropper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NgxCropperComponent implements OnInit, OnChanges {
  private originalImage: any;
  private originalBase64: string;

  @Input() format: 'png' | 'jpeg' = 'png';
  @Input() aspectRatio: number = 1;
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
  showLoader: boolean = false;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    console.log({ changes });
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

  showCropArea() {
    // TODO: calc ration
  }

  private clear() {
    this.imageSrc = null;
    this.originalImage = null;
  }
}
