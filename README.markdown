# CAT-32 MicroPython Font Converter

## Introduction

CAT-32 MicroPython Font Converter is a web tool designed to convert images into a custom format designed for CAT-32 display font writer MicroPython module.

While it is tailored for the CAT-32 display writer, users are free to create their own display writer from this converter.

The CAT-32 font module, when imported, provides a global object representing the font. This object can be accessed using dot notation and contains three attributes:

+ **w**: Represents the width of the letter in pixels.
+ **h**: Represents the height of the letter in pixels.
+ **char**: A dictionary containing the raw bit representation of each letter. The dictionary keys are the number ordinals of the respective letters (e.g., `65` for "A"), and the values are pixels as raw bit patterns (e.g., `0b00001110101011101010`).

Please note that this converter supports only monospaced fonts. Special characters like space are not included, as their behavior is typically handled by the writer module.

## Usage Example

```python
import myfont  # Import the CAT-32 font module

# Accessing font properties
width = myfont.w  # Get the font width in pixels
height = myfont.h  # Get the font height in pixels

# Accessing specific letter's raw bit data
letter = myfont.char[ord("A")]  # Get the raw bit pixel data for letter "A", e.g., 0b00001110101011101010...
# ... and so on for other letters
```

## Custom Writer

The raw bit data for each letter is sorted by row to column, starting from the top-left pixel and walking to the right, then going down to the next row, left to right, and so on until the bottom-right pixel.

Users can utilize this data to create their own font writer by iterating through the bits accordingly.

## License

CAT-32 MicroPython Font Converter is provided under the [MIT License](https://spdx.org/licenses/MIT.html). Feel free to use, modify, and distribute it according to the terms of the license.