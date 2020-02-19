import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChatWindows } from './messenger/services/chat-windows.service';
import { Events } from './messenger/services/events.service';
import { MessagesComponent } from './messenger/chat-window/messages/messages.component';
import { ChatWindowComponent } from './messenger/chat-window/chat-window.component';
import { MessengerComponent } from './messenger/messenger.component';
import { MessengerCore } from './messenger/core/messenger-core.service'


@NgModule({
  declarations: [
    MessengerComponent,
    ChatWindowComponent,
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
