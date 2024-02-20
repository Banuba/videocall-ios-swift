

let composer = bnb.scene.getAssetManager().findImage("camera").asProceduralTexture().asCameraComposer();
    composer.enableBlur(true);
    composer.setBlurRadius(5);
