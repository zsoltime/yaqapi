# Yet Another Quote API

## API Endpoints

| Done | Method | Route                           | Description                                                     |
| :--: | :----: | :------------------------------ | :-------------------------------------------------------------- |
| [ ]  |  GET   | /quotes/:num?                   | Get random quotes, limited to `:num` results (default is 1)     |
| [ ]  |  POST  | /quotes                         | Add new quote                                                   |
| [ ]  |  GET   | /quotes/:quoteId                | Get single quote                                                |
| [ ]  |  PUT   | /quotes/:quoteId                | Update quote                                                    |
| [ ]  | DELETE | /quotes/:quoteId                | Delete quote                                                    |
| [ ]  |  GET   | /quotes/on/:category            | Get all the quotes under `:category`                            |
| [ ]  |  GET   | /quotes/by/:author              | Get all the quotes by `:author`                                 |
| [ ]  |  GET   | /categories                     | Get all the categories                                          |
| [ ]  |  POST  | /categories                     | Add new category                                                |
| [ ]  |  GET   | /categories/:categoryId         | Get single category                                             |
| [ ]  |  PUT   | /categories/:categoryId         | Update category                                                 |
| [ ]  | DELETE | /categories/:categoryId         | Delete category                                                 |
| [x]  |  GET   | /authors                        | Get all the authors                                             |
| [x]  |  POST  | /authors                        | Add new author                                                  |
| [x]  |  GET   | /authors/:authorId              | Get single author                                               |
| [x]  |  PUT   | /authors/:authorId              | Update author                                                   |
| [x]  | DELETE | /authors/:authorId              | Delete author                                                   |
| [ ]  |  GET   | /quotes/search/:query/:num?     | Search for quotes, limited to `:num` results (default is 1)     |
| [ ]  |  GET   | /categories/search/:query/:num? | Search for categories, limited to `:num` results (default is 1) |
| [x]  |  GET   | /authors/search/:query/:num?    | Search for authors, limited to `:num` results (default is 1)    |
