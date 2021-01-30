/**
 * Copyright (c) 2021 Jacob Brasil
 *
 * MIT
 *
 * @summary Finds a Prof and Display's their RateMyProf stats
 * @author Jacob Brasil
 * @author N3rdP1um23
 *
 * Created at     : 2021-01-30 17:41:55 
 * Last modified  : 2021-01-30 17:42:14
 */

import Command from '../../lib/models/bot/command.model';
import { DMChannel, MessageEmbed, NewsChannel, Permissions, TextChannel } from 'discord.js';
import { parse } from 'node-html-parser';
import Axios from 'axios';
import Prompt from '../../lib/models/bot/prompt.model';

interface Prof {
    score?: number;
    retake?: string;
    level?: number;
    highlightReview?: string;
    id: number,
    name: string,
    role: string
}

export const RMP = new Command('rmp', 'Finds and Displays information on a Professor from RateMyProfessor', '!rmp <professor: string | number>', new Permissions(), (message, args, dbUser) => {
    // Check to see if the user has passed an argument
    if (args.length === 0) {
        // React to the message with a question mark as the command wasn't used properly
        message.react('❓');

        // Return to stop further processing
        return;
    }

    // Create the required variables
    let professor: string = args.join(' ');
    let findId = Number(professor);

    // Check to see if the id isn't a number
    if (isNaN(findId)) {
        // Parse the professors name and clear the original professor name
        let names: string[] = professor.split(' ');
        professor = '';

        // Iterate over each of the names and format the query string
        names.forEach((n, i) => {
            // Check to see if the index is matching
            if (i == names.length - 1) {
                // Set the professor query id
                professor += n;
            } else {
                // Append the professor query id
                professor += `${n}+`;
            }
        })

        // Prepare the search url
        let profSearchURL: string = `https://www.ratemyprofessors.com/search.jsp?queryoption=HEADER&queryBy=teacherName&schoolName=Sheridan+College&schoolID=&query=${professor}`;

        // Attempt the query
        try {
            // Initialize the request
            Axios.get(profSearchURL).then(result => {
                // Parse the result data and see if there are any profressor class items
                let listings = parse(result.data).querySelectorAll('.PROFESSOR');

                // Check to see if there aren't any found professors
                if (listings.length < 1) {
                    // Reply with a message that the professor may be mis-spelt and return to stop further processinf
                    message.reply('I had trouble finding that professor. Please double check your spelling!');
                    return;
                }

                // Create an array that will hold all found professors
                let foundProfs: Prof[] = []

                // Iterate over each of the professor listings
                listings.forEach((l, i) => {
                    // Create the requried variables and strip the reuqired information
                    let url = l.querySelector('a').getAttribute("href")
                    let id = Number(url!.slice(21))
                    let name = l.querySelector('.main').text
                    let role = l.querySelector('.sub').text

                    // Push the found professor to the foundProfs array
                    foundProfs.push({ id: id, name: name, role: role })
                });

                // Check to see if no professors were found
                if (foundProfs.length == 0) {
                    // Reply to the user with an error message that the profeessor wasn't found and return to stop further processing
                    message.reply('I had trouble finding that professor. Please double check your spelling!');
                    return;
                }

                // Check if there was more than one professor found
                if (foundProfs.length > 1) {
                    // Create a variable that will hold fields
                    let embeds: MessageEmbed[] = []
                    let profsProcessed = 0

                    // Iterate over each of the found professors
                    foundProfs.forEach((prof, i, a) => {
                        findProf(prof.id).then((p) => {
                            embeds.push(new MessageEmbed({
                                title: `${p.name} - Page (${embeds.length + 1} / ${a.length})`,
                                url: `https://www.ratemyprofessors.com/ShowRatings.jsp?tid=${p.id}`,
                                description: `Professor in the **${p.role}**`,
                                color: 4886754,
                                footer: {
                                    icon_url: "https://www.ratemyprofessors.com/images/favicon-32.png",
                                    text: "RateMyProfessors"
                                },
                                thumbnail: {
                                    url: `https://dummyimage.com/256x256/fff.png&text=${p.score}`
                                },
                                fields: [
                                    {
                                        name: "🔁 Would Retake?",
                                        value: `\`\`\`${p.retake} say YES\`\`\``,
                                        inline: true
                                    },
                                    {
                                        name: "⛓ Difficulty",
                                        value: `\`\`\`${p.level} / 5\`\`\``,
                                        inline: true
                                    },
                                    {
                                        name: "🗨 Top Review",
                                        value: `\`\`\`${p.highlightReview}\`\`\``
                                    }
                                ]
                            }))

                            profsProcessed++
                            if (profsProcessed === a.length) {
                                showMultiple(embeds, message.channel, message.author.id)
                            }
                        }).catch(err => message.reply('I had trouble finding that professor. Please double check your spelling!'))
                    })

                } else {
                    // Call the function to handle displaying the single professor
                    findProf(foundProfs[0].id).then(prof => {
                        // Formulate the professor embed
                        let profEmbed = new Prompt([
                            new MessageEmbed({
                                title: `${prof.name}`,
                                url: `https://www.ratemyprofessors.com/ShowRatings.jsp?tid=${prof.id}`,
                                description: `Professor in the **${prof.role}**`,
                                color: 4886754,
                                footer: {
                                    icon_url: "https://www.ratemyprofessors.com/images/favicon-32.png",
                                    text: "RateMyProfessors"
                                },
                                thumbnail: {
                                    url: `https://dummyimage.com/256x256/fff.png&text=${prof.score}`
                                },
                                fields: [
                                    {
                                        name: "🔁 Would Retake?",
                                        value: `\`\`\`${prof.retake} say YES\`\`\``,
                                        inline: true
                                    },
                                    {
                                        name: "⛓ Difficulty",
                                        value: `\`\`\`${prof.level} / 5\`\`\``,
                                        inline: true
                                    },
                                    {
                                        name: "🗨 Top Review",
                                        value: `\`\`\`${prof.highlightReview}\`\`\``
                                    }
                                ]
                            })
                        ]);

                        profEmbed.show(message.channel, message.author.id)
                    }).catch(err => message.reply('I had trouble finding that professor. Please double check your spelling!'))
                }
            });
        } catch (exception) {
            // Reply with an error, log the exception, and then return to stop further processing
            message.reply('I had trouble finding that professor. Please double check your spelling!');
            return;
        }
    } else {
        // Call the function to handle displaying the single professor
        findProf(findId)
    }
})

function findProf(findId: number): Promise<Prof> {
    let promise = new Promise<Prof>((res, rej) => {

        // Create a variable that will hold the formatted url
        let idUrl: string = `https://www.ratemyprofessors.com/ShowRatings.jsp?tid=${findId}`

        // Try and grab the professors data
        try {
            // Attmept the query
            Axios.get(idUrl).then(result => {
                // Check to see if there was an error with the request
                if (result.status === 301 || result.status === 404) {
                    // Reply with an error message and then return to stop further processing
                    rej(result.status)
                }

                // Parse the response and then initialize the professor instance
                let html = parse(result.data);
                let p: Prof = { id: 0, name: '', score: 0, role: '', retake: '', level: 0, highlightReview: '' };

                // Parse the page for class names for respective sections
                const page_classes = [...html.querySelectorAll('*')].map(element => [...element.classNames]);
                const name_class = page_classes.find(value => value.includes('NameTitle__Name-dowf0z-0'));
                const role_class = page_classes.find(value => value.includes('NameTitle__Title-dowf0z-1'));
                const score_class = page_classes.find(value => value.includes('RatingValue__Numerator-qw8sqy-2'));
                const retake_level_class = page_classes.find(value => value.includes('FeedbackItem__FeedbackNumber-uof32n-1'));
                const helpful_rating_class = page_classes.find(value => value.includes('Comments__StyledComments-dzzyvm-0'));

                // Initialize the stardard field values for the professor
                p.id = findId;
                p.name = `${html.querySelector('.' + name_class![0]).firstChild.text} ${html.querySelector('.' + name_class![0]).lastChild.text}`;
                p.role = `${html.querySelector('.' + role_class![0]).firstChild.childNodes[1].text}`;
                p.score = parseFloat(html.querySelector('.' + score_class![0]).text);

                // Try and parse a retake value
                try {
                    // Set the retake value from the parsed value
                    p.retake = `${html.querySelectorAll('.' + retake_level_class)[0].text}`;
                } catch {
                    // Set the retake value to a defauly value
                    p.retake = '0%';
                }

                // Try and parse a level
                try {
                    // Set the level to the parsed value
                    p.level = parseFloat(html.querySelectorAll('.' + retake_level_class)[1].text);
                } catch {
                    // Set the level to a default of 0
                    p.level = 0;
                }

                // Check to see if the retake value isn't a percentage
                if (p.retake.indexOf('%') === -1) {
                    // Set the level and retake values
                    p.level = Number(p.retake);
                    p.retake = '0%';
                }

                // Try and parse a highlighted rating
                try {
                    // Set the rating to the highlighted rating
                    p.highlightReview = `${html.querySelector('.' + helpful_rating_class![0]).text}`;
                } catch (err) {
                    // Handle setting a standard review
                    p.highlightReview = `Bummer, ${p.name} doesn't have any featured ratings...`;
                }

                res(p)
            }).catch(error => {
                // Reply with an error message, log the error, and return to stop further processing
                rej(error)
            });
        } catch (exception) {
            // Log the exception
            rej(exception)
        }
    })

    return promise
}

function showMultiple(embeds: MessageEmbed[], channel: TextChannel | DMChannel | NewsChannel, uuid: string) {
    let profsEmbed = new Prompt(embeds)
    profsEmbed.show(channel, uuid)
}