import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { chatWindowService } from './messenger/services/chatWindows.service';
import { messengerEvents } from './messenger/services/messengerEvents.service';
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
  providers: [chatWindowService, messengerEvents],

})
export class CommunicationModule { }
