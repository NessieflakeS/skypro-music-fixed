export const WORKING_AUDIO_SOURCES = [
  'https://webdev-music-003b5b991590.herokuapp.com/media/music_files/Alexander_Nakarada_-_Chase.mp3',
  'https://webdev-music-003b5b991590.herokuapp.com/media/music_files/Frank_Schroter_-_Open_Sea_epic.mp3',
  'https://webdev-music-003b5b991590.herokuapp.com/media/music_files/Kevin_Macleod_-_Sneaky_Snitch.mp3',
  'https://webdev-music-003b5b991590.herokuapp.com/media/music_files/Mixkit_-_Secret_Garden.mp3',
  'https://webdev-music-003b5b991590.herokuapp.com/media/music_files/Musiclfiles_-_A_Journey_For_Successful_Winners.mp3',
  'https://webdev-music-003b5b991590.herokuapp.com/media/music_files/Musiclfiles_-_Epic_Heroic_Conquest.mp3',
  'https://webdev-music-003b5b991590.herokuapp.com/media/music_files/musiclfiles_-_The_March_Of_The_Final_Battle.mp3',
  'https://webdev-music-003b5b991590.herokuapp.com/media/music_files/Musiclfiles_-_True_Summer.mp3',
  'https://webdev-music-003b5b991590.herokuapp.com/media/music_files/Waltz_Piano_-_Background_Sensible.mp3',
  'https://webdev-music-003b5b991590.herokuapp.com/media/music_files/Winniethemoog_-_Action_Sport_Breakbeat.mp3',
];

export const getAudioSourceForTrack = (trackId: number): string => {
  const sourceIndex = (trackId - 1) % WORKING_AUDIO_SOURCES.length;
  return WORKING_AUDIO_SOURCES[sourceIndex];
};