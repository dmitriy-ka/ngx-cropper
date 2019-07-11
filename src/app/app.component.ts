import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ng-app';
  name = 1;

  imageSrc;

  fileChangedEvent: any;
  constructor() {}

  onChangeFile(event) {
    this.fileChangedEvent = event;
  }

  imageCropped(event) {
    this.imageSrc = event;
  }
}
