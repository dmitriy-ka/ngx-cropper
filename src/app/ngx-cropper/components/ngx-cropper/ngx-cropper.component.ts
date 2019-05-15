import {
  Component,
  OnInit,
  Input,
  SimpleChanges,
  OnChanges
} from '@angular/core';

@Component({
  selector: 'ngx-cropper',
  templateUrl: './ngx-cropper.component.html',
  styleUrls: ['./ngx-cropper.component.scss']
})
export class NgxCropperComponent implements OnInit, OnChanges {
  private originalImage: any;
  private originalBase64: string;

  @Input() format: 'png' | 'jpeg' = 'png';
  @Input() aspectRatio = 1;
  get image(): boolean {
    return this.originalImage;
  }

  @Input()
  set fileChangedEvent(event: Event) {
    if (
      event &&
      event.target &&
      Array.isArray((event.target as HTMLInputElement).files) &&
      (event.target as HTMLInputElement).files.length > 0
    ) {
      const file = (event.target as HTMLInputElement).files[0];
      const isFileValid = this.isFileValid(file);
      if (!isFileValid) {
        // TODO:
        return;
      }
      this.originalImage = file;
      this.initialize(file);
    }
  }

  constructor() {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    console.log({ changes });
  }

  private isFileValid(file) {
    return true;
  }

  private initialize(file: any) {
    // TODO: parse ratio
  }
}
