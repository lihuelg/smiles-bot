import axios from "axios";
import { getBestDayFlight } from "../utils/flights.js";
import { getAllDateInMonth } from "../utils/date.js";
import { getChunksOf } from "../utils/array.js";
import { logError, logMessage, logTime, logTimeEnd } from "../utils/log.js";

let ACCESS_TOKEN;

const getToken = () => {
    return axios
        .post(
            `https://api-blue.smiles.com.ar/api/oauth/token`,
            {
                grant_type: "client_credentials",
                client_id: process.env.SMILES_CLIENT_ID,
                client_secret: process.env.SMILES_CLIENT_SECRET,
            },
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Referer: "https://www.smiles.com.ar/",
                },
            }
        )
        .then((response) => {
            ACCESS_TOKEN = response.data.access_token;
        })
        .catch((err) => {
            logError(`error getting Smiles access token: ${err.message}`);
        });
};

const searchForBestDayFlight = async ({
    originAirportCode,
    destinationAirportCode,
    departureDate,
}) => {
    try {
        logMessage(
            "searching for",
            `${originAirportCode} -> ${destinationAirportCode} at ${departureDate}`
        );
        logTime(
            `searching for ${originAirportCode} -> ${destinationAirportCode} at ${departureDate} finished`
        );
        const response = await axios.get(
            `https://api-air-flightsearch-prd.smiles.com.br/v1/airlines/search`,
            {
                params: {
                    adults: 1,
                    cabinType: "all",
                    children: 0,
                    currencyCode: "ARS",
                    departureDate,
                    destinationAirportCode,
                    infants: 0,
                    isFlexibleDateChecked: false,
                    originAirportCode,
                    tripType: 2,
                    forceCongener: true,
                    r: "ar",
                },
                headers: {
                    "Content-Type": "application/json",
                    Referer: "https://www.smiles.com.ar/",
                    Authorization: `Bearer ${ACCESS_TOKEN}`,
                    "x-api-key": process.env.SMILES_API_KEY,
                    "User-Agent": "none",
                    Region: "ARGENTINA",
                },
            }
        );

        const flights =
            response.data?.requestedFlightSegmentList?.[0]?.flightList;
        const bestDayFlight = getBestDayFlight(flights ?? []);
        logTimeEnd(
            `searching for ${originAirportCode} -> ${destinationAirportCode} at ${departureDate} finished`
        );
        return bestDayFlight;
    } catch (err) {
        const errorMessage = `error on day search: ${err.message} - Origin: ${originAirportCode} - Destination: ${destinationAirportCode}  - Day: ${departureDate}`;
        logError(errorMessage);
        return Promise.reject({
            error: errorMessage,
        });
    }
};

export const searchForBestMonthFlights = async ({
    originAirportCode,
    destinationAirportCode,
    departureDate,
}) => {
    if (!ACCESS_TOKEN) {
        await getToken();
    }
    logMessage(
        `searching for ${originAirportCode} -> ${destinationAirportCode} at ${departureDate}`
    );
    logTime(
        `searching for ${originAirportCode} -> ${destinationAirportCode} at ${departureDate} finished`
    );
    const departureDates = getAllDateInMonth(departureDate);

    // separate the departureDates in chunks of 10
    const chunks = getChunksOf(departureDates, 10);
    const flights = [];

    // run the search for each chunk
    for (const chunk of chunks) {
        const bestFlights = await Promise.all(
            chunk.map((departureDate) =>
                searchForBestDayFlight({
                    originAirportCode,
                    destinationAirportCode,
                    departureDate,
                })
            )
        );
        flights.push(...bestFlights);
    }

    logTimeEnd(
        `searching for ${originAirportCode} -> ${destinationAirportCode} at ${departureDate} finished`
    );

    return flights;
};
