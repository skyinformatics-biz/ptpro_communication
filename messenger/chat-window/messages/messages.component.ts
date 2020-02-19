import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ChatWindows } from '../../services/chat-windows.service';
import { Events } from '../../services/events.service';
import { RestfulAPI } from '../../../../../providers/services/RestfulAPI.service';
import { SharingService } from '../../../../../providers/guards/sharing.service';
import { SocketEcho } from '../../../../../providers/services/SocketEcho.service'

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {

  @ViewChild("Messages", { read: ElementRef, static: false }) private Messages: ElementRef;
  @ViewChild("chatBody", { read: ElementRef, static: false }) private chatBody: ElementRef;

  private initialMessageClient = "Your request to the trainer has been sent. Please wait for response for their response.";
  private initialMessageSeller = "You have got an request from a new client, please accept or reject the offer.";


  ngOnInit() {
    this.scrollDownInChat()
  }

  constructor(private Chat: ChatWindows, private events: Events, private api: RestfulAPI, private account: SharingService, private socket: SocketEcho) {
    //super(api, account, socket);

    this.events.chatWindow.eventHandler.subscribe(
      (data: any) => {

        if (data.task === 'requestMessage') {

          this.Chat.Window[0]['messages'][data.index].accepted = data.desicion;
          this.Chat.Window[0]['messages'][data.index].text = 'Kontakten er etablert';
        }

      });


  }

  public getRequestMessageText(index, type) {

    switch (type) {
      case 1:
        var initialMessage = this.Chat.Window[0].accepted;
        if (initialMessage == 2) {
          var message = this.Chat.Window[0]['messages'][0].text = (this.account.memberType === 'Client') ? this.initialMessageClient : this.initialMessageSeller;
        }
        else if (initialMessage == 1) {
          var message = "Contact has been etablished."
        }

        return message;

      default:
        return "No message at the moment.";
    }


  }

  postRequestDesicion(index, chatId, message, value, salesPlanId=null) {

    var initialMessage = (index === 0) ? true : false;
    var responseId = (this.account.memberType === 'Seller') ? message.senderId : message.recieverId;

    const data = { 'type': 2, 'index': index, 'chatId': chatId, 'responseId': responseId, 'decision': value, 'initial': initialMessage };

    this.api.post('communication', data, 'secure').subscribe(response => {

      console.log('desicion', data);
      console.log('res', response);

      this.events.messenger.updateContact(index, value);
      this.events.chatWindow.requestMessageOption(value, index, chatId);
      

    });

    this.Chat.Window[0].accepted = value;

  }



  scrollDownInChat() {
    try {

      this.chatBody.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });

    } catch (error) {

    }
  }



}
