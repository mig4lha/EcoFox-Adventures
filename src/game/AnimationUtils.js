export const createButtonAnimation = (scene, spriteSheetKey, animKey) => {
    scene.anims.create({
        key: animKey,
        frames: scene.anims.generateFrameNumbers(spriteSheetKey, { start: 0, end: -1 }),
        frameRate: 24,
        repeat: 0
    });
};