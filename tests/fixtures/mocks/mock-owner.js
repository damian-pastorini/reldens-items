/**
 *
 * Reldens - Mock Owner
 *
 */

const { EventsManagerSingleton } = require('@reldens/utils');

class MockOwner
{

    constructor(id = 'mock-owner-1')
    {
        this.id = id;
        this.events = EventsManagerSingleton;
        this.state = {};
        this.stats = {
            atk: 10,
            def: 5,
            hp: 100,
            mp: 50
        };
    }

    updateStat(key, value)
    {
        if(!this.stats[key]){
            this.stats[key] = 0;
        }
        this.stats[key] = value;
    }

}

module.exports.MockOwner = MockOwner;
