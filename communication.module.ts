import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChatWindows } from './messenger/core/chat-windows.service';
import { Events } from './messenger/core/events.service';
import { MessagesComponent } from './messenger/structural/messages/messages.component';
import { MessengerComponent } from './messenger/messenger.component';
import { MessengerCore } from './messenger/core/messenger-core.service'


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
  providers: [ MessengerCore, ChatWindows, Events],

})
export class CommunicationModule { }
