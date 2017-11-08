var MazeTraveler = MazeTraveler || {};

//title screen
MazeTraveler.Game = function(){};

MazeTraveler.Game.prototype = {
  //find objects in a Tiled layer that containt a property called "type" equal to a certain value
  findObjectsByType: function(type, map, layer) {
    var result = new Array();
    map.objects[layer].forEach(function(element){
      if(element.properties.type === type) {
        //Phaser uses top left, Tiled bottom left so we have to adjust the y position
        //also keep in mind that the cup images are a bit smaller than the tile which is 16x16
        //so they might not be placed in the exact pixel position as in Tiled
        element.y -= map.tileHeight;
        result.push(element);
      }      
    });
    return result;
  },
  //create a sprite from an object
  createFromTiledObject: function(element, group) {
    var sprite = group.create(element.x, element.y, element.properties.sprite);

      //copy all properties to the sprite
      Object.keys(element.properties).forEach(function(key){
        sprite[key] = element.properties[key];
      });
  },
  createItems: function() {
    //create items
    this.items = this.game.add.group();
    this.items.enableBody = true;
    var item;    
    result = this.findObjectsByType('item', this.map, 'Objects');
    result.forEach(function(element){
      this.createFromTiledObject(element, this.items);
    }, this);
  },
  create: function() {
    this.map = this.game.add.tilemap('maze1');

    //the first parameter is the tileset name as specified in Tiled, the second is the key to the asset
    this.map.addTilesetImage('terrain', 'gameTiles');

    //create layer
    this.backgroundlayer = this.map.createLayer('Background');
    this.wallsLayer = this.map.createLayer('Walls');

    //collision on blockedLayer
    this.map.setCollisionBetween(1, 100000, true, 'Walls');

    //resizes the game world to match the layer dimensions
    this.backgroundlayer.resizeWorld();
    this.createItems();

     //create player
    var result = this.findObjectsByType('playerStart', this.map, 'Objects')

    //we know there is just one result
    this.player = this.game.add.sprite(result[0].x, result[0].y, 'player');
    this.game.physics.arcade.enable(this.player);

    //the camera will follow the player in the world
    this.game.camera.follow(this.player);

    //move player with cursor keys
    this.cursors = this.game.input.keyboard.createCursorKeys();
  },
  update: function() {
    //player movement
    this.player.body.velocity.y = 0;
    this.player.body.velocity.x = 0;

    if(this.cursors.up.isDown) {
      this.player.body.velocity.y -= 64;
    }
    else if(this.cursors.down.isDown) {
      this.player.body.velocity.y += 64;
    }
    if(this.cursors.left.isDown) {
      this.player.body.velocity.x -= 64;
    }
    else if(this.cursors.right.isDown) {
      this.player.body.velocity.x += 64;
    }
    //collision
    this.game.physics.arcade.collide(this.player, this.wallsLayer);
    this.game.physics.arcade.overlap(this.player, this.items, this.collect, null, this);
    //this.game.physics.arcade.overlap(this.player, this.doors, this.enterDoor, null, this);
  },
  collect: function(player, collectable) {
    console.log('yummy!');

    //remove sprite
    collectable.destroy();
  }
}