# friskis-slack-booking
Webhook for managing activity bookings at Friskis &amp; Svettis Uppsala

## Usage
### Find
Find activities with *find*.

`/friskis find step`

The output is a list of activities, with `activityid`.

# Book
Book activity with *book*.

`/friskis book [activityid]`

The output is a success response with the `bookingid`.

# Cancel
Cancel a booked activity with *cancel*

`/friskis cancel [bookingid]`

The output is a success response with the `bookingid`.
