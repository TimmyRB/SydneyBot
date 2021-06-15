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
 * Last modified  : 2021-01-30 21:23:56
 */

import { Command, Prompt } from '../../lib/models/bot';
import { DMChannel, MessageEmbed, NewsChannel, Permissions, TextChannel } from 'discord.js';
import { parse } from 'node-html-parser';
import Axios from 'axios';

interface Prof {
    score?: number;
    retake?: string;
    level?: number;
    highlightReview?: string;
    id: number,
    name: string,
    role: string
}

export const RMP = new Command({
    name: 'rmp',
    desc: 'Finds and Displays information on a Professor from RateMyProfessor',
    options: [
        {
            name: 'name',
            type: 'STRING',
            description: 'The professor\'s name',
            required: true
        }
    ],
    permissions: new Permissions(),
    callback: (interaction, args, dbUser) => {

        let professor = encodeURI(args.get('name')?.value as string);

        // Prepare the search url
        let profSearchURL: string = `https://www.ratemyprofessors.com/search.jsp?queryoption=HEADER&queryBy=teacherName&schoolName=Sheridan+College&schoolID=&query=${professor}`;

        // Attempt the query
        try {
            // Initialize the request
            Axios.get(profSearchURL).then(result => {
                // Parse the result data and see if there are any profressor class items
                let listings = parse(result.data).querySelectorAll('.dLJIlx');

                // Check to see if there aren't any found professors
                if (listings.length < 1) {
                    // Reply with a message that the professor may be mis-spelt and return to stop further processinf
                    interaction.editReply('I had trouble finding that professor. Please double check your spelling! 58');
                    return;
                }

                // Create an array that will hold all found professors
                let foundProfs: Prof[] = []


                // Iterate over each of the professor listings
                for (let l of listings) {
                    // Create the requried variables and strip the reuqired information
                    let url = l.getAttribute("href")
                    let id = parseInt(url!.slice(url!.indexOf('=') + 1), 10)
                    let name = l.querySelector('.cJdVEK').text
                    let role = l.querySelector('.haUIRO').text

                    // Push the found professor to the foundProfs array
                    foundProfs.push({ id: id, name: name, role: role })
                }

                // Check to see if no professors were found
                if (foundProfs.length == 0) {
                    // Reply to the user with an error message that the profeessor wasn't found and return to stop further processing
                    interaction.editReply('I had trouble finding that professor. Please double check your spelling!');
                    return;
                }

                foundProfs = foundProfs.filter(p => p.name === foundProfs[0].name);
                foundProfs.slice(0, 3)

                for (let prof of foundProfs) {
                    findProf(prof.id).then((p) => {
                        interaction.followUp({
                            embeds: [new MessageEmbed({
                                title: `${p.name}`,
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
                                        value: `\`\`\`${p.retake !== '-1%' ? p.retake + ' say YES' : 'No Rating'}\`\`\``,
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
                            })]
                        })
                    }).catch(err => { interaction.editReply(`I had trouble finding that professor. Please double check your spelling!`) })
                }
            })
        } catch (exception) {
            // Reply with an error, log the exception, and then return to stop further processing
            interaction.editReply('I had trouble finding that professor. Please double check your spelling!');
            return;
        }
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
                const name_class = html.querySelector('.NameTitle__Name-dowf0z-0');
                const role_class = html.querySelector('.NameTitle__Title-dowf0z-1');
                const score_class = html.querySelector('.RatingValue__Numerator-qw8sqy-2');
                const retake_level_class = html.querySelectorAll('.FeedbackItem__StyledFeedbackItem-uof32n-0');
                const helpful_rating_class = html.querySelector('.Comments__StyledComments-dzzyvm-0');

                let school = role_class!.lastChild.text
                if (school.toLowerCase().indexOf('sheridan college') === -1) rej('Wrong School')

                // Initialize the stardard field values for the professor
                p.id = findId;
                p.name = `${name_class!.firstChild.text} ${name_class!.lastChild.text}`;
                p.role = `${role_class!.firstChild.childNodes[1].text}`;
                p.score = parseFloat(score_class!.text);

                // Try and parse a retake value
                try {
                    // Set the retake value from the parsed value
                    p.retake = `${retake_level_class[0].firstChild.text}`;
                } catch {
                    // Set the retake value to a defauly value
                    p.retake = '-1%';
                }

                // Try and parse a level
                try {
                    // Set the level to the parsed value
                    p.level = parseFloat(retake_level_class[1].firstChild.text);
                } catch {
                    // Set the level to a default of 0
                    p.level = 0;
                }

                // Check to see if the retake value isn't a percentage
                if (p.retake.indexOf('%') === -1) {
                    // Set the level and retake values
                    p.level = Number(p.retake);
                    p.retake = '-1%';
                }

                // Try and parse a highlighted rating
                try {
                    // Set the rating to the highlighted rating
                    p.highlightReview = `${helpful_rating_class!.text}`;
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