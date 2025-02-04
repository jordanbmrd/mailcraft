const generateDefaultEmail = (subject: string, author: string) => ({
  "counters": {
    "u_row": 3,
    "u_column": 3,
    "u_content_menu": 1,
    "u_content_text": 4,
    "u_content_divider": 1
  },
  "body": {
    "id": "main-body",
    "rows": [
      {
        "id": "header-row",
        "cells": [1],
        "columns": [
          {
            "id": "header-column",
            "contents": [
              {
                "id": "main-heading",
                "type": "heading",
                "values": {
                  "headingType": "h1",
                  "textAlign": "center",
                  "text": subject,
                  "fontSize": "32px",
                  "color": "#333333",
                  "padding": "20px 10px"
                }
              }
            ]
          }
        ]
      },
      {
        "id": "content-row",
        "cells": [1],
        "columns": [
          {
            "id": "main-content",
            "contents": [
              {
                "id": "welcome-text",
                "type": "text",
                "values": {
                  "text": "<p style='text-align: center;'>Start creating amazing emails with our platform. Edit this section to add your content.</p>",
                  "padding": "20px 10px",
                  "fontSize": "16px"
                }
              }
            ]
          }
        ]
      },
      {
        "id": "footer-row",
        "cells": [1],
        "columns": [
          {
            "id": "footer-column",
            "contents": [
              {
                "id": "footer-menu",
                "type": "menu",
                "values": {
                  "menu": {
                    "items": [
                      {
                        "text": "Privacy Policy",
                        "link": "{{privacy_policy_url}}"
                      },
                      {
                        "text": "Unsubscribe",
                        "link": "{{unsubscribe_url}}"
                      }
                    ]
                  },
                  "textAlign": "center",
                  "padding": "20px 10px"
                }
              },
              {
                "id": "footer-divider",
                "type": "divider",
                "values": {
                  "border": {
                    "borderTopWidth": "1px",
                    "borderTopStyle": "solid",
                    "borderTopColor": "#cccccc"
                  }
                }
              },
              {
                "id": "footer-text",
                "type": "text",
                "values": {
                  "text": `<p style='text-align: center; color: #666666; font-size: 12px;'>© ${new Date().getFullYear()} - Made by ${author}. All rights reserved.<br>123 Business Street, City, Country</p>`,
                  "padding": "20px 10px"
                }
              }
            ]
          }
        ]
      }
    ],
    "values": {
      "backgroundColor": "#ffffff",
      "fontFamily": {
        "value": "Helvetica, Arial, sans-serif"
      },
      "linkStyle": {
        "linkColor": "#0071e3",
        "linkHoverColor": "#0056b3"
      }
    }
  }
});

export default generateDefaultEmail;