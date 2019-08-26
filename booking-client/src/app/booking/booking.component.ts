import { Component, OnInit } from "@angular/core";
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

class Booking {
  constructor(
    public date: NgbDateStruct = null,
    public id: string = ""
  ) {}
}

class Room {
  constructor(
    public id: string= "",
    public name: string = "",
    public description: string = "",
    public capacity: string = ""
  ) {}
}

@Component({
  selector: "app-booking",
  templateUrl: "./booking.component.html",
  styleUrls: ["./booking.component.css"]
})
export class BookingComponent implements OnInit {
  bookings: Array<any> = [];
  rooms: Array<any> = [];
  regModel: Booking;
  showNew: Boolean = false;
  submitType: string = "Save";
  selectedRow: number;
  selectedRoom: Room; 
  bookingList: Array<any> = []; 
  roomList: Array<any> = []

  constructor(private apollo: Apollo) {}

  ngOnInit() {
    this.displayRooms();
  }

  displayRooms() {
    const getRooms = gql`
      {
        rooms {
          id
          name
          description
          capacity
        }
      }
    `;

    this.apollo
      .watchQuery({
        query: getRooms,
        fetchPolicy: "network-only"
      })
      .valueChanges.pipe(map((result: any) => result.data.rooms))
      .subscribe(data => {
        this.rooms = data;
      })
  }

  onNew(room) {
    this.regModel = new Booking();
    this.submitType = "Save";
    this.showNew = true;
    this.selectedRoom = room
  }

  onSave() {
    var dateVal =
      this.regModel.date.year.toString() +
      "-" +
      this.regModel.date.month.toString() +
      "-" +
      this.regModel.date.day.toString();
    if (this.submitType === "Save") {
      const saveBooking = gql`
        mutation createBooking(
          $booking: BookingInput!
        ) {
          createBooking(
            booking: $booking
          ){
            id
            date
            room {
              name
            }
          }
        }
      `;
      this.apollo
        .mutate({
          mutation: saveBooking,
          variables: {
            booking: {
              date: new Date(dateVal),
              roomId: this.selectedRoom.id
            }
          }
        })
        .subscribe(
          ({ data }) => {
            this.displayRooms();
          },
          error => {
            alert(error);
          }
        );
    }    
    this.showNew = false;
  }

  onCancel() {
    this.showNew = false;
  }
}
