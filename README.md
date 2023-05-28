# TailwindCSS Template Card for Home Assistant

![GitHub](https://img.shields.io/github/license/usernein/tailwindcss-template-card)
![GitHub stars](https://img.shields.io/github/stars/usernein/tailwindcss-template-card)
![GitHub issues](https://img.shields.io/github/issues/usernein/tailwindcss-template-card)
![GitHub pull requests](https://img.shields.io/github/issues-pr/usernein/tailwindcss-template-card)

The TailwindCSS Template Card is a custom card for Home Assistant that allows you to write HTML code using TailwindCSS classes and render it beautifully in the Home Assistant dashboard. This card provides flexibility in designing custom interfaces within Home Assistant, allowing you to create visually appealing and interactive elements.

## Features

- **HTML Rendering**: Write HTML code directly in your Home Assistant configuration, utilizing the power of HTML and TailwindCSS.
- **TailwindCSS Classes**: Use TailwindCSS classes to style your HTML elements, giving you access to a wide range of pre-built styles and responsive design options.
- **Responsive Design**: Leverage the responsiveness of TailwindCSS to create layouts that adapt to different screen sizes and devices.
- **Interactive Elements**: Create interactive elements with JavaScript and CSS within your HTML code, enhancing the user experience of your Home Assistant dashboard.

## Demo

## Installation

### With HACS

Set `https://github.com/usernein/tailwindcss-template-card` as a custom repository in HACS. Now you should receive the TailwindCSS Template Card as new plugin to install.

### Manually

1. Copy the `tailwindcss-template-card` directory to your Home Assistant's `config/www` directory.
2. Add the following to your Home Assistant's `configuration.yaml` file:

```yaml
lovelace:
  resources:
    - url: /local/tailwindcss-template-card/dist/tailwindcss-template-card.js
      type: module
```

3. Restart Home Assistant to load the custom card.

## Usage

To use the TailwindCSS Template Card, follow these steps:

1. Open your Home Assistant dashboard.
2. Edit the Lovelace configuration by clicking on the three dots in the upper right corner and selecting "Configure UI" or by manually editing the `ui-lovelace.yaml` file.
3. Add a new card and select the "TailwindCSS Template Card" from the available card types.
4. In the card configuration, you can define your HTML code using TailwindCSS classes to style the elements.
5. Save the configuration and enjoy your custom-designed card in your Home Assistant dashboard.

## Example

Here's some example of how you can use the TailwindCSS Template Card to create beautiful cards in your Home Assistant dashboard:

```yaml
type: custom:tailwindcss-template-card
content: |
  <div class="bg-slate-300 p-4 rounded-lg shadow-md">
    <h2 class="text-xl text-black font-semibold mb-2">My Custom Card</h2>
    <p class="text-gray-700">This is a custom card created using HTML and TailwindCSS classes.</p>
    <button class="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded">Click Me</button>
  </div>

```

```yaml
type: custom:tailwindcss-template-card
ignore_line_breaks: true
content: |
  <div class="m-auto rotate-90 text-3xl w-32 h-32 bg-sky-900 rounded-3xl flex justify-center items-center hover:scale-110 transition-all">
    :)
  </div>

```

In this example, we have created a card with a gray background, rounded corners, and a shadow. It contains a title, a description, and a button styled with TailwindCSS classes.

## Acknowledgements

I would like to extend my sincere gratitude to the following projects, libraries, and individuals for their contributions and inspiration:

- [TailwindCSS](https://tailwindcss.com/) and [Home Assistant](https://home-assistant.io): obvious reasons <3
- [threedy-card](https://github.com/dangreco/threedy): the card that helped me to understand the way of working with Preact in custom cards
- [Home-Assistant-Lovelace-HTML-Jinja2-Template-card](https://github.com/PiotrMachowski/Home-Assistant-Lovelace-HTML-Jinja2-Template-card): the amazing card that teached me the way of rendering Jinja templates with Home Assistant
- [Twind.style](https://twind.style): the reason why this card is possible
- [Gourav Goyal](https://www.linkedin.com/in/gorvgoyl/): who wrote [this amazing article](https://gourav.io/blog/tailwind-in-shadow-dom) that presented me to Twind

## Contributing

Contributions to the TailwindCSS Template Card for Home Assistant are welcome! If you have any ideas, suggestions, or bug reports, please open an issue on the [GitHub repository](https://github.com/usernein/tailwindcss-template-card/issues). Pull requests are also encouraged.

Before making significant changes, please discuss them with the repository maintainers to ensure they align with the project's goals and direction.

## License

This project is licensed under the [MIT License](LICENSE.txt).
