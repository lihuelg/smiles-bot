import { config } from "dotenv";
config();

import { searchForBestMonthFlights } from "./api/smiles.js";
import { transformFlightsForChatBot } from "./utils/flights.js";

import { Telegraf } from "telegraf";

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

bot.command("iniciar", (ctx) => {
    bot.telegram.sendMessage(
        ctx.chat.id,
        `Bienvenido al Smiles bot de ${process.env.ENV}\\. */buscar BUE MAD 202305* para buscar vuelos`,
        { parse_mode: "MarkdownV2" }
    );
});

bot.command("buscar", async (ctx) => {
    if(/[A-Z]{3} [A-Z]{3} 202[3-9][0-1][0-9]/.test(ctx.message.text) === false) {
        bot.telegram.sendMessage(
            ctx.chat.id,
            `El formato es */buscar BUE MAD 202305* para buscar vuelos`,
            { parse_mode: "MarkdownV2" }
        );
        return;
    }
    bot.telegram.sendMessage(ctx.chat.id, "Los minions estan buscando las mejores opciones...");
    const [originAirportCode, destinationAirportCode, departureDate] =
        ctx.message.text.split(" ").slice(1);

    const bestDayFlights = await searchForBestMonthFlights({
        originAirportCode,
        destinationAirportCode,
        departureDate,
    });

    const message = transformFlightsForChatBot(bestDayFlights).join("\n");

    bot.telegram.sendMessage(ctx.chat.id, message, {
        parse_mode: "MarkdownV2",
    });
});

if (process.env.ENV !== "production") {
    bot.launch();
}

export const handler = async function (event) {
    try {
        console.log("event", event, process.env.TELEGRAM_TOKEN);
        await bot.handleUpdate(event);
    } catch (error) {
        console.error("Error handling update", error.message);
    }
    return  {
        body: 'OK',
        statusCode: 200,
        headers: {
          'Content-Type': 'text/plain'
        }
      }
};
