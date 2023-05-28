# TailwindCSS Template Card for Home Assistant

![GitHub](https://img.shields.io/github/license/usernein/tailwindcss-template-card)
![GitHub stars](https://img.shields.io/github/stars/usernein/tailwindcss-template-card)
![GitHub issues](https://img.shields.io/github/issues/usernein/tailwindcss-template-card)
![GitHub pull requests](https://img.shields.io/github/issues-pr/usernein/tailwindcss-template-card)

The TailwindCSS Template Card is a custom card for Home Assistant that allows you to write HTML code using TailwindCSS classes and render it beautifully in the Home Assistant dashboard. This card provides flexibility in designing custom interfaces within Home Assistant, allowing you to create visually appealing and interactive elements.

![Screenshot from 2023-05-28 00-27-09](https://github.com/usernein/tailwindcss-template-card/assets/29507335/70aeea39-ec94-4cf2-aad1-54c95f44fe12)

## Features

- **HTML Rendering**: Write HTML code directly in your Home Assistant configuration, utilizing the power of HTML and TailwindCSS.
- **TailwindCSS Classes**: Use TailwindCSS classes to style your HTML elements, giving you access to a wide range of pre-built styles and responsive design options.
- **Responsive Design**: Leverage the responsiveness of TailwindCSS to create layouts that adapt to different screen sizes and devices.
- **Interactive Elements**: Create interactive elements with CSS within your HTML code, enhancing the user experience of your Home Assistant dashboard.
- **Real-time Preview**: Write your HTML code with TailwindCSS classes and instantly see it rendered with the power of [Twind.style](https://twind.style)

## Demo

https://github.com/usernein/tailwindcss-template-card/assets/29507335/752667e7-df4a-4c73-a151-e03c7fc67ba7

https://github.com/usernein/tailwindcss-template-card/assets/29507335/c0c1e086-f76e-4908-beed-79e747bcc15c

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

Here are some examples of how you can use the TailwindCSS Template Card to create beautiful cards in your Home Assistant dashboard:

## Example 1

![Screenshot from 2023-05-28 00-29-30](https://github.com/usernein/tailwindcss-template-card/assets/29507335/b5df7254-adb3-4b74-9400-7359f209fd3e)

```yaml
type: custom:tailwindcss-template-card
content: |
  <div class="bg-slate-300 p-4 rounded-lg shadow-md">
    <h2 class="text-xl text-black font-semibold mb-2">My Custom Card</h2>
    <p class="text-gray-700">This is a custom card created using HTML and TailwindCSS classes.</p>
    <button class="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded">Click Me</button>
  </div>
```

## Example 2

![Screenshot from 2023-05-28 00-29-43](https://github.com/usernein/tailwindcss-template-card/assets/29507335/45e8dc7f-ee3e-47e5-870b-6e4b8ec78569)

```yaml
type: custom:tailwindcss-template-card
ignore_line_breaks: true
content: |
  <div class="m-auto rotate-90 text-3xl w-32 h-32 bg-sky-900 rounded-3xl flex justify-center items-center hover:scale-110 transition-all">
    :)
  </div>
```

## Example 3

![Screenshot from 2023-05-28 00-29-53](https://github.com/usernein/tailwindcss-template-card/assets/29507335/223aa226-7e5f-496a-b025-7146e26a5bfc)

```yaml
type: custom:tailwindcss-template-card
content: |
  <div
    class="flex flex-row justify-center items-center gap-2">
    <div class="w-12 h-12 bg-slate-300 rounded-lg cursor-pointer hover:translate-y-2 transition-all"></div>
    <div class="w-12 h-12 bg-red-300 rounded-lg cursor-pointer hover:translate-y-2 transition-all"></div>
    <div class="w-12 h-12 bg-purple-300 rounded-lg cursor-pointer hover:translate-y-2 transition-all"></div>
    <div class="w-12 h-12 bg-cyan-300 rounded-lg cursor-pointer hover:translate-y-2 transition-all"></div>
    <div class="w-12 h-12 bg-blue-300 rounded-lg cursor-pointer hover:translate-y-2 transition-all"></div>
    <div class="w-12 h-12 bg-green-300 rounded-lg cursor-pointer hover:translate-y-2 transition-all"></div>
    <div class="w-12 h-12 bg-yellow-300 rounded-lg cursor-pointer hover:translate-y-2 transition-all"></div>
  </div>
```

## Example 4

![Screenshot from 2023-05-28 00-59-39](https://github.com/usernein/tailwindcss-template-card/assets/29507335/71e85db0-aa96-47e7-a4c0-0d2bd87b7a30)

```yaml
type: custom:tailwindcss-template-card
content: |
  <div class="relative h-48 bg-sky-300 rounded-3xl text-black">
    <div class="absolute top-1/3 left-10 h-24 w-24 rounded-full bg-yellow-300 animate-bounce"></div>
    <div class="absolute right-10 top-2/4 -translate-y-2/4 text-black font-bold">
      The sun is {{ states('sun.sun') }}
      <div class="text-slate-700 font-medium">Rising: {{ 'yes' if state_attr('sun.sun', 'rising') else 'no'}} </div>
    </div>
  </div>
```

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
