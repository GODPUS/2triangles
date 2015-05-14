// Populates shader object with loaded GLSL code
function loadShaders(path, array, callback) {
    var count = 0;
    var shaders = {};

    $.each(array, function(index, value){
        $.get(path+value, function(data){
            count++;

            var name = value.split('.')[0];
            var filetype = value.split('.')[1];

            if(!shaders[filetype]){ shaders[filetype] = {}; }

            shaders[filetype][name] = data;

            if(count === array.length){ callback(shaders); }
        });
    });
}

if (!Date.now) {
    Date.now = function() {
        return +new Date();
    };
}