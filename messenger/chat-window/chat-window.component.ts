import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ChatWindows } from '../core/chat-windows.service'
import { SharingService } from '../../../../providers/guards/sharing.service';
import { RestfulAPI } from '../../../../providers/services/RestfulAPI.service';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent implements OnInit {

  @ViewChild('messageText', { read: ElementRef, static: false }) messageText: ElementRef;
  @ViewChild("ChatBody", { read: ElementRef, static: false }) public chatBody: ElementRef;

  constructor(public Chat: ChatWindows, public account:SharingService,public api: RestfulAPI) { }

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

  public postMessage(index = 0) {
    var Text = this.messageText.nativeElement.value;
    if (Text == '')
      return;

    var data = {
      'type': 3,
      'text': Text,
      'salesPlanId': this.Chat.Window[index].salesPlanId,
      'chatId': this.Chat.Window[index]['chatId'],
      'senderId': this.account.uid,
      'recieverId': this.Chat.Window[index]['recieverId']

    }
 
    this.api.post('communication', data, 'secure').subscribe(response => {

      console.log(response);
      this.messageText.nativeElement.value = '';
      this.scrollDownInChatBody();

    });
  }


  private scrollDownInChatBody() {
    try {
      this.chatBody.nativeElement.lastChild.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });

    } catch (error) {
      console.log(error);
    }
  }
}
