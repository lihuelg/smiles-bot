import { getFlightDateUnixTime, getFlightDateForChatBot } from "./date.js";

const getSmilesClubFare = (flight) => {
    return flight.fareList.find((fare) => fare.type === "SMILES_CLUB");
};

const getFlightUrl = (flight) =>
    // TODO: Complete using the flight info
    `https://www.smiles.com.ar/emission?originAirportCode=&destinationAirportCode=&departureDate=${getFlightDateUnixTime(
        flight
    )}&adults=1&infants=0&children=0&cabinType=all&tripType=2`;

export const getBestDayFlight = (flights) => {
    let cheapestFlight;
    let cheapestFare;

    for (const flight of flights) {
        const smilesClubFare = getSmilesClubFare(flight);

        if (
            !cheapestFlight ||
            cheapestFare.miles > smilesClubFare.miles
            // && cheapestFare.airlineTax > smilesClubFare.airlineTax)
        ) {
            cheapestFlight = flight;
            cheapestFare = smilesClubFare;
        }
    }

    return cheapestFlight;
};

export const transformFlightsForChatBot = (flights) =>
    flights
        // TODO: Define a chepeast flight helper using computed miles to ARS and airline tax
        .sort((a, b) => getSmilesClubFare(a).miles - getSmilesClubFare(b).miles)
        .map((flight) => {
            const smilesClubFare = getSmilesClubFare(flight);

            return `🛫 [${getFlightDateForChatBot(flight)}](${getFlightUrl(
                flight
            )}): *${smilesClubFare.miles}* \\+ $${
                parseInt(smilesClubFare.airlineTax) +
                parseInt(smilesClubFare.airlineFareAmount)
            }, *${flight.airline.name}*, ${flight.duration.hours}:${
                flight.duration.minutes
            }hs, *${flight.cabin}*, 💺 ${flight.availableSeats}`;
        });
