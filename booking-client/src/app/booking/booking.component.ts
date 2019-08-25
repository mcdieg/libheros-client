import { Component, OnInit } from "@angular/core";
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
import "rxjs/add/operator/map";

class Booking {
  constructor(
    public firstName: string = "",
    public lastName: string = "",
    public dob: NgbDateStruct = null,
    public email: string = "",
    public password: string = "",
    public country: string = "Select country"
  ) {}
}

@Component({
  selector: "app-booking",
  templateUrl: "./booking.component.html",
  styleUrls: ["./booking.component.css"]
})
export class BookingComponent implements OnInit {
  // It maintains list of Registrations
  registrations: Array<any> = [];
  // It maintains booking Model
  regModel: Booking;
  // It maintains booking form display status. By default it will be false.
  showNew: Boolean = false;
  // It will be either 'Save' or 'Update' based on operation.
  submitType: string = "Save";
  // It maintains table row index based on selection.
  selectedRow: number;
  // It maintains Array of countries.
  countries: string[] = ["US", "UK", "India", "UAE"];

  registrationList: Array<any> = []; // List of Users


  constructor(private apollo: Apollo) {}

  ngOnInit() {
    this.displayBookings();
  }

  // Get all registrations
  displayBookings() {
    const getBookings = gql`
      {
        Bookings {
          id
          firstName
          lastName
          dob
          email
          country
        }
      }
    `;

    this.apollo
      .watchQuery({
        query: getBookings,
        fetchPolicy: "network-only"
      })
      .valueChanges.map((result: any) => result.data.Bookings)
      .subscribe(data => {
        this.registrations = data;
      });
  }

  // This method associate to New Button.
  onNew() {
    // Initiate new booking.
    this.regModel = new Registration();
    // Change submitType to 'Save'.
    this.submitType = "Save";
    // display booking entry section.
    this.showNew = true;
  }

  // This method associate to Save Button.
  onSave() {
    var dateVal =
      this.regModel.dob.year.toString() +
      "-" +
      this.regModel.dob.month.toString() +
      "-" +
      this.regModel.dob.day.toString();
    if (this.submitType === "Save") {
      const saveRegistration = gql`
        mutation createRegistration(
          $firstName: String!
          $lastName: String!
          $dob: GQDate!
          $email: String!
          $password: String!
          $country: String!
        ) {
          createRegistration(
            firstName: $firstName
            lastName: $lastName
            dob: $dob
            email: $email
            password: $password
            country: $country
          ) {
            id
            dob
          }
        }
      `;
      this.apollo
        .mutate({
          mutation: saveRegistration,
          variables: {
            firstName: this.regModel.firstName,
            lastName: this.regModel.lastName,
            dob: new Date(dateVal),
            email: this.regModel.email,
            password: this.regModel.password,
            country: this.regModel.country
          }
        })
        .subscribe(
          ({ data }) => {
            this.displayRegistrations();
          },
          error => {
            console.log("there was an error sending the query", error);
          }
        );

      // Push booking model object into booking list.
      // this.registrations.push(this.regModel);
    } else {
      const updateRegistration = gql`
        mutation updateRegistration(
          $id: ID!
          $firstName: String!
          $lastName: String!
          $dob: GQDate!
          $email: String!
          $password: String!
          $country: String!
        ) {
          updateRegistration(
            id: $id
            firstName: $firstName
            lastName: $lastName
            dob: $dob
            email: $email
            password: $password
            country: $country
          ) {
            id
            country
          }
        }
      `;
      this.apollo
        .mutate({
          mutation: updateRegistration,
          variables: {
            id: this.selectedRow + 1,
            firstName: this.regModel.firstName,
            lastName: this.regModel.lastName,
            dob: new Date(dateVal),
            email: this.regModel.email,
            password: this.regModel.password,
            country: this.regModel.country
          }
        })
        .subscribe(
          ({ data }) => {
            console.log("got editdata", data);
            this.displayRegistrations();
          },
          error => {
            console.log("there was an error sending the query", error);
          }
        );
    }
    // Hide booking entry section.
    this.showNew = false;
  }

  // This method associate to Edit Button.
  onEdit(index: number) {
    // Assign selected table row index.
    this.selectedRow = index;
    // Initiate new booking.
    this.regModel = new Registration();
    // Retrieve selected booking from list and assign to model.
    this.regModel = Object.assign({}, this.registrations[this.selectedRow]);
    const dob = new Date(this.registrations[this.selectedRow].dob);

    this.regModel.dob = {
      day: dob.getDate(),
      month: dob.getMonth() + 1,
      year: dob.getFullYear()
    };

    // Change submitType to Update.
    this.submitType = "Update";
    // Display booking entry section.
    this.showNew = true;
  }

  // This method associate to Delete Button.
  onDelete(index: number) {
    const deleteRegistration = gql`
      mutation deleteRegistration($id: ID!) {
        deleteRegistration(id: $id) {
          id
        }
      }
    `;
    this.apollo
      .mutate({
        mutation: deleteRegistration,
        variables: {
          id: index + 1
        }
      })
      .subscribe(
        ({ data }) => {
          console.log("got editdata", data);
          this.displayRegistrations();
        },
        error => {
          console.log("there was an error sending the query", error);
        }
      );
  }

  // This method associate toCancel Button.
  onCancel() {
    // Hide booking entry section.
    this.showNew = false;
  }

  // This method associate to Bootstrap dropdown selection change.
  onChangeCountry(country: string) {
    // Assign corresponding selected country to model.
    this.regModel.country = country;
  }
}
