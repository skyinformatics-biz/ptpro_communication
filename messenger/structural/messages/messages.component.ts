import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ChatWindows } from '../../core/chat-windows.service';
import { Events } from '../../core/events.service';
import { RestfulAPI } from '../../../../../providers/services/RestfulAPI.service';
import { SharingService } from '../../../../../providers/guards/sharing.service';
import { SocketEcho } from '../../../../../providers/services/SocketEcho.service'

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent extends ChatWindows implements OnInit {

  @ViewChild("Messages", { read: ElementRef, static: false }) private Messages: ElementRef;
  @ViewChild("chatBody", { read: ElementRef, static: false }) private chatBody: ElementRef;

  private initialMessageClient = "You're request to trainers has been sent";
  private initialMessageSeller = "You have got an request from a new client, please accept or reject the offer";


  constructor(private events: Events, api:RestfulAPI, account:SharingService, socket:SocketEcho) {
    super(api, account, socket);
    
    this.events.Manager.subscribe(
      (data: any) => {

        if (data.task === 'requestmessage') {

          this.Window[0]['messages'][data.index].accepted = data.desicion;
          this.Window[0]['messages'][data.index].text = 'Kontakten er etablert';

          this.events.emitUpdateContact('Forespørsel godkjent', data.chatId);

        }

      });
  }

  public getRequestMessageText(type){

      switch (type) {
        case 1:
          const message = (this.account.memberType === 'Client') ? this.initialMessageClient : this.initialMessageSeller;
          return message;
      
        default:
          break;
      }


  }

  ngOnInit() {
    this.scrollDownInChat()
  }

  scrollDownInChat() {
    try {

      this.chatBody.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });

    } catch (error) {

    }
  }

  postRequestDesicion(index, recieverId, req, chatId) {

    var initial = (index === 0) ? true : false;
    const data = { type: 2, index: index, chatId: chatId, recieverId: recieverId, desicion: req, initial: initial };
    
    this.api.post('communication', data, 'secure').subscribe(response => {

      console.log('desicion', data);
      console.log('res', response);

      this.events.emitRequestDesicion(req, index, chatId);

    });

    this.Window[0].accepted = req;

  }

}
