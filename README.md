# QuickPy

[![Build Status](https://img.shields.io/github/workflow/status/arnemar/quickpy/CI)](https://github.com/arnemar/quickpy/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**QuickPy** is a Visual Studio Code extension that provides **live feedback** on Python code execution. This is a modification of the original project by [Kalle Hallden](https://github.com/kallehallden).

---

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)
- [Contact](#contact)

---

## Features 

- **Live Python Execution**: See your code in action instantly as you write.
- **Error Feedback**: Get quick visual indications of errors in your code.
- **Integrated Workflow**: Works seamlessly within the VS Code editor.

---

## Installation

1. Clone the repository:
   ```bash
        git clone https://github.com/arnemar/quickpy.git
2. Build the .vsix file:
    ```bash
        npm install
        npm run package
3.Install the extension manually in Visual Studio Code:
    - Open VS Code and navigate to the Extensions sidebar (Ctrl+Shift+X or Cmd+Shift+X).
    - Click on the three dots (...) in the top right corner and select Install from VSIX.
    - Select the generated .vsix file from your project directory.

---

## Usage

1. Open a Python file in VS Code.
2. Start editing your code and see the results directly in the editor!
    - Example:
    ```bash
        x = 5
        print(x + 10)  # Output: 15

---

## Contributing

We welcome contributions to improve QuickPy! Here’s how you can get started:

1. Fork the repository:
    ```bash
        git clone https://github.com/arnemar/quickpy.git
2. Install dependencies:
    ```bash
        npm install
3. Open the project in Visual Studio Code and start developing.
4. Submit a pull request with your changes.

---

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

---

## Acknowledgements

 - This project is inspired by [Lowpy](https://github.com/kallehallden/lowpy) by [Kalle Hallden](https://github.com/kallehallden).
 - [Quokka.js](https://quokkajs.com/) for JavaScript inspiration.
 - Built using the [VS Code API](https://code.visualstudio.com/api) and [Python](https://www.python.org/).

---

## Contact

For any questions, issues, or suggestions:

 Open an issue on [Github](https://github.com/arnemar/quickpy/issues).

---

## 🚀 Try QuickPy today and make Python development faster and more fun!


