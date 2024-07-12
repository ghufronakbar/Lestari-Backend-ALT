const email_style = () => {
    const style = `
      <style>
                                                                                        /* Style email content */
                                                                                        body {
                                                                                            font-family: Arial, sans-serif;
                                                                                            line-height: 1.6;
                                                                                        }
                                                                                        .container {
                                                                                            max-width: 600px;
                                                                                            margin: auto;
                                                                                            padding: 20px;
                                                                                            border: 1px solid #ccc;
                                                                                            border-radius: 5px;
                                                                                            background-color: #f9f9f9;
                                                                                        }
                                                                                        h1 {
                                                                                            color: #333;
                                                                                        }
                                                                                        p {
                                                                                            color: #666;
                                                                                        }
                                                                                        .button {
                                                                                            display: inline-block;
                                                                                            padding: 10px 20px;
                                                                                            background-color: #4CAF50;
                                                                                            color: white;
                                                                                            text-decoration: none;
                                                                                            border-radius: 5px;
                                                                                        }
                                                                                    </style>`
    return style
}

module.exports = { email_style }