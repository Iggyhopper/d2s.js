var D2S =
{
    getChecksum: function(array)
    {
        var copy = array.slice(), carry = 0, checksum = [0, 0, 0, 0];
        copy[12] = copy[13] = copy[14] = copy[15] = 0;
        for (var i = 0, l = copy.length; i < l; ++i)
        {
            checksum[3] = checksum[3] * 2 + copy[i] + carry;
            for (var j = 3; j != 0; --j)
            {
                checksum[j - 1] *= 2;
                if (checksum[j] > 255)
                {
                    checksum[j - 1] = checksum[j - 1] + (checksum[j] - (checksum[j] % 256)) / 256;
                    checksum[j] %= 256;
                }
            }
            if (checksum[0] > 256)
                checksum[0] %= 256;
            carry = (checksum[0] & 128) != 0 ? 1 : 0;
        }
        return checksum.reverse();
    },
    load: function(input, callback)
    {
        var file, type = typeof input, save = new D2SFile();
        if (type == 'object')
        {
            if (input.jquery)
                file = input[0].files[0];
            else if (input.toString() == '[object HTMLInputElement]')
                file = input.files[0];
            else
                return false;
        }
        else if (type == 'string')
            return false;
        else
            return false;
        var freader = new FileReader();
        freader.onload = function(e) {
            var reader = new BinaryReader(e.target.result);
            rr = reader;
            save.file =
            {
                name: file.name,
                size: file.size
            };
            save.data =
            {
                header: ['h', reader.ruint()],
                version: ['h-p', reader.rint()],
                size: reader.rint(),
                checksum: ['h', reader.ruint()],
                unknown16: reader.rint(),
                name: ['srd', reader.rstring(16)],
                status: reader.rbyte(),
                progress: reader.rbyte(),
                unknown38: reader.rshort(),
                class: ['d-p', reader.rbyte()],
                unknown41: reader.rshort(),
                displayLevel: reader.rbyte(),
                unknown44: reader.rint(),
                timeStamp: reader.rint(),
                unknown52: reader.rint(),
                skillBinds: reader.rbytes(64),
                leftMouseBind: reader.rint(),
                rightMouseBind: reader.rint(),
                alternateLeftMouseBind: reader.rint(),
                alternateRightMouseBind: reader.rint(),
                unknown136: reader.rbytes(32),
                difficulty: reader._decodeInt(24, true),
                linkedMapID: reader.rlong(),
                unknown175: reader.rshort(),
                unknown177: reader.rshort(),
                mercenaryID: reader.rint(),
                mercenaryName: reader.rshort(),
                mercenaryData: reader.rshort(),
                mercenaryExperience: reader.rint(),
                unknown191: reader.rbytes(144),
                questData: (function()
                {
                    return {
                        header: reader.rstring(4),
                        unknown339: reader.rbytes(6),
                        normal:
                        {
                            firstAct: reader.rshort(),
                            data: reader.rbytes(94*3)
                        },
                        nightmare:
                        {
                            
                        },
                        hell:
                        {
                            
                        }
                    };
                })()
            };
            save.info = (function(data)
            {
                // Example: in = "linkedMapID", out = "Linked Map ID"
                //          in = "unknown99Ex", out = "Unknown 99 Ex"
                var makeFormal = function(string)
                {
                    // compare n and n+1 for capitalization and numbers
                    // split "...aB..." into "...a B..."
                    // split "...1A..." into "...1 A..."
                    // capitalize the first letter
                    for (var i = 0, j = 1, c = string.length; i < c; ++i, ++j) // j = i + 1
                        if (string[i] !== string[i].toUpperCase() && (string[j] ? string[j] === string[j].toUpperCase() : true) || (+string[i]+.1 && !(+string[j]+.1)))
                            string = string.substring(0, j++) + ' ' + string.substring(i++ + 1, c++);
                    return string[0].toUpperCase() + string.substring(1).trim();
                };
                var parseData = function(object)
                {
                    var array = [];
                    for (var key in object)
                    {
                        var formalKey = makeFormal(key);
                        var value = object[key];
                        if (typeof value == 'object' && !value.push)
                            array.push({name: formalKey, value: parseData(value), isGroup: true});
                        else
                        {
                            var formattedValue = value;
                            if (value.push && typeof value[0] == 'string')
                            {
                                switch (value[0].split('-')[0])
                                {
                                    case 'h': // Display as hex.
                                        formattedValue = '0x' + value[1].toString(16).toUpperCase();
                                        break;
                                    case 'srd': // Display as string with array.
                                        formattedValue = value[1].match(/[a-z\-\_]+/i);
                                        if (formattedValue)
                                            formattedValue += ' [' + formattedValue[0].length + '/' + value[1].length + ']';
                                        break;
                                    case 'd': // Lookup in dictionary.
                                        formattedValue = D2S.lookup[key][value[1]];
                                        break;
                                }
                                if (value[0][value[0].length - 1] == 'p') // Print integer value.
                                    formattedValue += ' (' + value[1] + ')';
                            }
                            array.push({name: formalKey, value: formattedValue});
                        }
                    }
                    return array;
                };
                return parseData(data);
            })(save);
            callback(save);
        }
        freader.onerror = function(e) {
            console.log("FileReader Exception: ", e);
        };
        freader.readAsBinaryString(file);
    }
};

D2S.lookup =
{
    class: 'Amazon,Sorceress,Necromancer,Paladin,Barbarian,Druid,Assassin'.split(','),
    mercenaryName: null,
    title: [['None,Dame,Lady,Baroness'.split(','), 'None,Countess,Duchess,Queen'.split(',')], [['None', 'Sir', 'Lord', 'Baron'], ['None', 'Count', 'Duke', 'King']]]
};

function D2SFile()
{
    
}

D2SFile.prototype =
{
    
};