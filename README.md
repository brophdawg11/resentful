# Resentful

  A tiny little utility to make Contentful API responses easier to manage.

## Example

  Turn this:

```json
[
    {
        "sys": {
            "id": "xrs4HpKn6KSIqWskSm8K2",
            "contentType": { "sys": { ... } },
            "space": { "sys": { ... } },
            ...
        },
        "fields": {
            "textField": "This is some text",
            "textListField": [ "This", "is", "a", "list", "of", "text" ],
            "numberField": 54321,
            "booleanField": false,
            "nestedConfig": {
                "sys": {
                    "id": "3VaTkmzJfWMEGU6eMIgAWm",
                    "contentType": { "sys": { ... } },
                    "space": { "sys": { ... } },
                    ...
                },
                "fields": {
                    "nestedTextField": "This is some nested text",
                    "nestedTextListField": [
                        "this", "is", "a", "list", "of", "nested", "text"
                    ],
                    "nestedNumberField": 54321,
                    "nestedBooleanField": true,
                    "nestedLocalizedText": [{
                        "sys": {
                            "id": "2z7fYJxYW8oUSWuO4Yi8ek",
                            "contentType": { "sys": { ... } },
                            "space": { "sys": { ... } },
                            ...
                        },
                        "fields": {
                            "slug": "nested-slug",
                            "translation": "Nested translation "
                        }
                    }]
                }
            }
        }
    }
]
```

Into this:

```json
{
    "textField": "This is some text",
    "textListField": [ "This", "is", "a", "list", "of", "text" ],
    "numberField": 54321,
    "booleanField": false,
    "nestedConfig": {
        "nestedTextField": "This is some nested text",
        "nestedTextListField": [
            "this", "is", "a", "list", "of", "nested", "text"
        ],
        "nestedNumberField": 54321,
        "nestedBooleanField": true,
        "nestedLocalizedText": [{
            "slug": "nested-slug",
            "translation": "Nested translation "
        }]
    }
}
```

## Usage

  Pretty darn simple:

```javascript
const Resentful = require('resentful');
const resentful = new Resentful();
const reduced = resentful.reduce(contentfulApiData);
```

### Mappers

  Need to hang onto some metadata in some cases?  Just grab it during a pre-mapping phase for the `contentType` and dump it into the `fields` object, and it'll be treated just like a normal property:

```javascript
const Resentful = require('resentful');
const resentful = new Resentful();

resentful.registerMappers('nestedConfig', (entry) => {
    return _.set(entry, 'fields.meta', {
        contentType: entry.sys.contentType.sys.id
    });
});

const reduced = resentful.reduce(data);

// Produces
// {
//     ...,
//     "nestedConfig": {
//         ...,
//         "meta": {
//             "contentType": "nestedConfig"
//         } 
//     }
// }
```

  Need to do some post-processing on a reduced entry?  Just grab it during a post-mapping phase for the `contentType` and modify it:

```javascript
const Resentful = require('resentful');
const resentful = new Resentful();

resentful.registerMappers('nestedConfig', null, (entry) => {
    entry.nestedNumberField += 10000;
    return entry;
});

const reduced = resentful.reduce(data);

// Produces
// {
//     ...,
//     "nestedConfig": {
//         ...,
//         "nestedNumberField": 64321
//     }
// }
```

## Api

* **Resentful()**
  Constructor, no available arguments

* **registerMappers(contentType, preMapper, postMapper)**
  Registers optional pre- and post-mappers for the given `contentType`, as indicated by `entry.sys.contentType.sys.id`

## License

  MIT
