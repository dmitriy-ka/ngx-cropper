import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ng-app';
  name = 1;

  fileChangedEvent: any;
  constructor() {}

  onChangeFile(event) {
    this.fileChangedEvent = event;
  }
}
