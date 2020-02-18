import { Component, OnInit } from '@angular/core';
import { ChatWindows } from '../core/chat-windows.service'

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent implements OnInit {

  constructor(public Chat: ChatWindows) { }

  ngOnInit() {
  }

  public getChatWindow(index = 0) {

    try {
      return this.Chat.Window[index].open;
    } catch (error) {
      return false;
    }

  }

  
  public toggleChatWindow(index) {

  }

}
