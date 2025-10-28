import type { ScaleDetails, PlaygroundSuggestion } from '../types';

export const MOCK_OVERVIEW: ScaleDetails['overview'] = {
    title: 'E Natural Minor Scale',
    character: 'Melancholic, somber, and versatile. The foundation of countless songs in Western music.',
    theory: 'Also known as the Aeolian mode, it is the 6th mode of G Major. It features a minor third, minor sixth, and minor seventh, giving it its characteristic sad or pensive sound.',
    usage: 'Extremely common in rock, pop, metal, and classical music for everything from sad ballads to heavy riffs.',
    parentScale: 'G Major',
    relativeModes: 'This is the 6th mode of G Major. You can also use these same notes to play A Dorian, B Phrygian, C Lydian, D Mixolydian, or F# Locrian.'
};

export const MOCK_LISTENING_GUIDE: ScaleDetails['listeningGuide'] = [
    { title: 'Stairway to Heaven (Solo)', artist: 'Led Zeppelin', spotifyLink: 'https://open.spotify.com/track/5CQ30WqJwcep0pYcV4AMNc' },
    { title: 'Losing My Religion', artist: 'R.E.M.', spotifyLink: 'https://open.spotify.com/track/31AOj9sFz2gM0O3hMARRBx' },
    { title: 'Californication', artist: 'Red Hot Chili Peppers', spotifyLink: 'https://open.spotify.com/track/48UPSzbZjgc449aqz8bxox' },
    { title: 'Zombie', artist: 'The Cranberries', spotifyLink: 'https://open.spotify.com/track/2IZZqH4K02UIYg5EohpNHF' },
];

export const MOCK_YOUTUBE_TUTORIALS: ScaleDetails['youtubeTutorials'] = [
    { title: 'Master The Natural Minor Scale In 3 Minutes', creator: 'Paul Davids', youtubeLink: 'https://www.youtube.com/watch?v=i_cWeCHb-sQ' },
    { title: 'When to Use the Natural Minor Scale', creator: 'MusicTheoryForGuitar', youtubeLink: 'https://www.youtube.com/watch?v=1dF9Xo_3hI0' },
    { title: 'The Sound of the Aeolian Mode', creator: 'Signals Music Studio', youtubeLink: 'https://www.youtube.com/watch?v=84jW-i4L-g0' },
];

export const MOCK_CREATIVE_APPLICATION: ScaleDetails['creativeApplication'] = [
    { title: 'How To Use The Minor Scale For EPIC GUITAR SOLOS', creator: 'Rick Beato', youtubeLink: 'https://www.youtube.com/watch?v=TUEwV352rGg' },
    { title: 'Making the Minor Scale Sound More Interesting', creator: 'Ben Eller Guitars', youtubeLink: 'https://www.youtube.com/watch?v=gI-q24y3L-M' },
    { title: 'Writing a Song with the Natural Minor Scale', creator: 'Andrew Huang', youtubeLink: 'https://www.youtube.com/watch?v=E4yZqSjI3aA' },
];

export const MOCK_JAM_TRACKS: ScaleDetails['jamTracks'] = [
    { title: 'E Minor Backing Track | Emotional Ballad', creator: 'Elevated Jam Tracks', youtubeLink: 'https://www.youtube.com/watch?v=FjV3DE3b_Sg' },
    { title: 'Funky Rock Jam in E Minor', creator: 'Tom Bailey Backing Tracks', youtubeLink: 'https://www.youtube.com/watch?v=L2AWj--A5v0' },
    { title: 'Acoustic Sad Ballad Jam in E Minor', creator: 'Chusss Music', youtubeLink: 'https://www.youtube.com/watch?v=f-zo_5g6-4Q' },
];

export const MOCK_TONE_AND_GEAR: ScaleDetails['toneAndGear'] = {
    suggestions: [
        { setting: 'Amp', description: 'A slightly overdriven tube amp sound works well. Use the neck pickup for a warmer, smoother solo tone.' },
        { setting: 'Effects', description: 'Add a touch of reverb or delay to give the notes more space and emotional weight.' },
    ],
    famousArtists: 'David Gilmour, Slash, Jimmy Page, John Frusciante',
};

export const MOCK_LICKS: ScaleDetails['licks'] = [
    {
        name: 'Classic Blues-Rock Lick',
        description: 'A simple, effective lick that uses a bend on the G string.',
        sourceUrl: 'https://www.youtube.com/',
        tab: {
            columns: [
                [{ string: 2, fret: '12' }],
                [{ string: 2, fret: '15b17' }],
            ],
        },
    },
];

export const MOCK_HARMONIZATION: ScaleDetails['advancedHarmonization'] = [
    { name: 'Harmonizing in Thirds', description: 'Practice playing the scale in diatonic thirds to create beautiful, harmonized melodies.' },
];

export const MOCK_ETUDES: ScaleDetails['etudes'] = [
    {
        name: 'Minor Etude No. 1',
        description: 'A short piece to practice moving between positions using the E Natural Minor scale.',
        tab: { columns: [] },
    },
];

export const MOCK_MODE_SPOTLIGHT: ScaleDetails['modeSpotlight'] = {
    name: 'E Dorian',
    explanation: 'By raising the 6th degree of E Natural Minor (from C to C#), you get E Dorian. This small change has a huge impact on the mood.',
    soundAndApplication: 'E Dorian sounds brighter and more hopeful than Natural Minor. It is very common in funk, jazz, and fusion music.',
};

export const MOCK_ANALYSIS_TEXT = "This classic @@i@@-@@VI@@-@@III@@-@@VII@@ progression is a staple in minor key songwriting, creating a feeling of melancholic but hopeful movement. The progression starts on the tonic @@i@@ (@@Emin@@), establishing our home base. It then moves to the submediant @@VI@@ (@@Cmaj@@), which provides a beautiful lift and a moment of brightness. The move to the mediant @@III@@ (@@Gmaj@@) continues this lift, as it's the relative major of our key. Finally, the subtonic @@VII@@ (@@Dmaj@@) creates a gentle pull back to the tonic @@i@@ chord, providing a softer resolution than a dominant @@V@@ chord would. For improvisation, focus on targeting the root notes of each chord. A great voice leading path is the @@G@@ note in your @@Emin@@ chord moving down to the same @@G@@ in the @@Cmaj@@ chord, creating a smooth, common-tone connection. This progression is perfect for a verse or a thoughtful, emotional chorus.";


export const MOCK_PLAYGROUND_SUGGESTIONS: PlaygroundSuggestion[] = [
    {
        name: "G Major Triad (Root Position)",
        description: "This is the most fundamental G major sound, built directly from your anchor note. It's a stable, consonant choice.",
        diagram: {
            notes: [
                { string: 2, fret: 8, finger: '2', noteName: 'G', degree: 'R' },
                { string: 1, fret: 7, finger: '1', noteName: 'B', degree: '3' },
                { string: 0, fret: 7, finger: '1', noteName: 'D', degree: '5' },
            ],
            barres: [{ fromString: 0, toString: 1, fret: 7 }],
            fretRange: [6, 10]
        }
    },
    {
        name: "E Minor Arpeggio Fragment",
        description: "This fragment of the parent scale's tonic arpeggio (E-G-B) is easily reachable and reinforces the overall minor tonality.",
        diagram: {
            notes: [
                { string: 3, fret: 5, finger: '1', noteName: 'G', degree: 'b3' },
                { string: 2, fret: 8, finger: '4', noteName: 'B', degree: '5' },
                { string: 1, fret: 5, finger: '1', noteName: 'E', degree: 'R' }
            ],
            fretRange: [4, 9]
        }
    },
    {
        name: "C Lydian Fragment",
        description: "For a brighter, more modern sound, you can imply C Lydian starting from this G. The F# is the characteristic #4 of C Lydian.",
        diagram: {
            notes: [
                { string: 2, fret: 8, noteName: 'G', degree: '5' },
                { string: 2, fret: 6, noteName: 'F#', degree: '#4' },
                { string: 3, fret: 5, noteName: 'G', degree: '5' },
            ],
            fretRange: [4, 9]
        }
    }
];
