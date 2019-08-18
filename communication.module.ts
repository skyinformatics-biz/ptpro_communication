import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChatwindowsService } from './messenger/services/chatwindows.service';
import { MessagesComponent } from './messenger/structural/messages/messages.component';
import { MessengerComponent } from './messenger/messenger.component';


@NgModule({
  declarations: [
    MessengerComponent,
    MessagesComponent,
  ],
  imports: [
    CommonModule,

    // Locale routing paths
    RouterModule.forChild([
      /*
      { path: '', component: HomeComponent, pathMatch: 'full' },
      { path: 'counter', component: CounterComponent },
      */
    ])
  ],
  exports: [MessengerComponent],
  providers: [ChatwindowsService],

})
export class CommunicationModule { }
