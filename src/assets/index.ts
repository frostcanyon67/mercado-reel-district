/**
 * The only image names that exist in this project (fixed Codex contract).
 * Never add a name here that is not on the list.
 */
export const images = {
  bgGame: require('../../assets/bg_game.png'),
  logo: require('../../assets/logo.png'),
  iconHome: require('../../assets/icon_home.png'),
  iconPause: require('../../assets/icon_pause.png'),
  sprite1: require('../../assets/sprite_1.png'),
  sprite2: require('../../assets/sprite_2.png'),
  sprite3: require('../../assets/sprite_3.png'),
  sprite4: require('../../assets/sprite_4.png'),
  sprite5: require('../../assets/sprite_5.png'),
  buttonRect: require('../../assets/button_rect.png'),
  buttonRound: require('../../assets/button_round.png'),
};

export type SpriteKey = 'sprite_1' | 'sprite_2' | 'sprite_3' | 'sprite_4' | 'sprite_5';

const SPRITES: Record<SpriteKey, number> = {
  sprite_1: images.sprite1,
  sprite_2: images.sprite2,
  sprite_3: images.sprite3,
  sprite_4: images.sprite4,
  sprite_5: images.sprite5,
};

export function spriteFor(key: SpriteKey): number {
  return SPRITES[key];
}
