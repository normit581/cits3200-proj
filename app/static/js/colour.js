function colourNameToHex(colourName) {
    // Create a temporary element
    const element = $('<div>').css('color', colourName).appendTo('body').get(0);
    // Get the computed colour value
    const colourRGB = window.getComputedStyle(element).color;
    // Remove the temporary element
    $(element).remove();
    
    // Convert RGB to HEX
    if (colourRGB) {
        const rgbArray = colourRGB.match(/\d+/g);
        if (rgbArray && rgbArray.length === 3) {
            const hex = '#' +
                ('0' + parseInt(rgbArray[0], 10).toString(16)).slice(-2) +
                ('0' + parseInt(rgbArray[1], 10).toString(16)).slice(-2) +
                ('0' + parseInt(rgbArray[2], 10).toString(16)).slice(-2);
            return hex;
        }
    }
    return null; // Return null if the colour couldn't be determined
}

function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }).join('');
}

function rgbStringToHex(rgb) {
    // Extract the numbers from the RGB string
    const result = rgb.match(/\d+/g).map(Number);
    return rgbToHex(result[0], result[1], result[2]);
}