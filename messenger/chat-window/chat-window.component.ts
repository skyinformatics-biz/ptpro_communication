import { Component, OnInit, ViewChild, AfterViewChecked, ElementRef } from '@angular/core';
import { ChatWindows } from '../services/chat-windows.service'
import { SharingService } from '../../../../providers/guards/sharing.service';
import { RestfulAPI } from '../../../../providers/services/RestfulAPI.service';
import { Events } from '../services/events.service'

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent implements OnInit {

  @ViewChild('messageText', { read: ElementRef, static: false }) messageText: ElementRef;
  @ViewChild("chatBody", { read: ElementRef, static: false }) public chatBody: ElementRef;

  constructor(public Chat: ChatWindows, public account: SharingService, public api: RestfulAPI, public events: Events) { }

  ngOnInit() {


  }

  ngAfterViewChecked() {
    if(this.Chat.Window[0].open){
      this.scrollDownInChatBody();
    }
  
  }

  public getChatWindow(index = 0) {

    try {

      return this.Chat.Window[index].open;
    } catch (error) {
      return false;
    }

  }

  public toggleChatWindow(index) {
    if (this.Chat.Window[index].open) {

      this.Chat.Window[index].open = false;
    }
    else {
      this.Chat.Window[index].open = true;

    }
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

      console.log("Message send response: ", response);
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
