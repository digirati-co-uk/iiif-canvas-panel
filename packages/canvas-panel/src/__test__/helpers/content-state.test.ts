import {
  normaliseContentState,
  parseContentState,
  serialiseContentState,
} from '../../helpers/content-state/content-state';

const fixture1 =
  'JTdCJTIyaWQlMjIlM0ElMjJodHRwcyUzQSUyRiUyRmV4YW1wbGUub3JnJTJGb2JqZWN0MSUyRmNhbnZhczclMjN4eXdoJTNEMTAwMCUyQzIwMDAlMkMxMDAwJTJDMjAwMCUyMiUyQyUyMnR5cGUlMjIlM0ElMjJDYW52YXMlMjIlMkMlMjJwYXJ0T2YlMjIlM0ElNUIlN0IlMjJpZCUyMiUzQSUyMmh0dHBzJTNBJTJGJTJGZXhhbXBsZS5vcmclMkZvYmplY3QxJTJGbWFuaWZlc3QlMjIlMkMlMjJ0eXBlJTIyJTNBJTIyTWFuaWZlc3QlMjIlN0QlNUQlN0Q';

describe('content state', () => {
  test('Encoding example from specification', () => {
    expect(
      serialiseContentState({
        id: 'https://example.org/object1/canvas7#xywh=1000,2000,1000,2000',
        type: 'Canvas',
        partOf: [{ id: 'https://example.org/object1/manifest', type: 'Manifest' }],
      })
    ).toEqual(fixture1);
  });

  test('Parse example from specification', () => {
    expect(parseContentState(fixture1)).toEqual({
      id: 'https://example.org/object1/canvas7#xywh=1000,2000,1000,2000',
      type: 'Canvas',
      partOf: [{ id: 'https://example.org/object1/manifest', type: 'Manifest' }],
    });
  });

  test('Normalisation', () => {
    const parsed = parseContentState(fixture1);
    const normalised = normaliseContentState(parsed);

    expect(normalised).toMatchInlineSnapshot(
      { id: expect.any(String) },
      `
      Object {
        "extensions": Object {},
        "id": Any<String>,
        "motivation": Array [
          "contentState",
        ],
        "target": Array [
          Object {
            "selector": Object {
              "height": 2000,
              "type": "BoxSelector",
              "unit": "pixel",
              "width": 1000,
              "x": 1000,
              "y": 2000,
            },
            "selectors": Array [
              Object {
                "height": 2000,
                "type": "BoxSelector",
                "unit": "pixel",
                "width": 1000,
                "x": 1000,
                "y": 2000,
              },
            ],
            "source": Object {
              "id": "https://example.org/object1/canvas7",
              "partOf": Array [
                Object {
                  "id": "https://example.org/object1/manifest",
                  "type": "Manifest",
                },
              ],
              "type": "Canvas",
            },
            "type": "SpecificResource",
          },
        ],
        "type": "Annotation",
      }
    `
    );
  });

  describe('Normalisation variations', function () {
    test('2.2.3. Target Body', () => {
      expect(normaliseContentState({ id: 'https://example.org/manifest-1', type: 'Manifest' })).toMatchInlineSnapshot(
        { id: expect.any(String) },
        `
        Object {
          "extensions": Object {},
          "id": Any<String>,
          "motivation": Array [
            "contentState",
          ],
          "target": Array [
            Object {
              "selector": null,
              "selectors": Array [],
              "source": Object {
                "id": "https://example.org/manifest-1",
                "type": "Manifest",
              },
              "type": "SpecificResource",
            },
          ],
          "type": "Annotation",
        }
      `
      );
    });
    test('Simple canvas', () => {
      expect(
        normaliseContentState({
          id: 'https://example.org/canvas-1',
          type: 'Canvas',
          partOf: 'https://example.org/manifest-1',
        })
      ).toMatchInlineSnapshot(
        { id: expect.any(String) },
        `
        Object {
          "extensions": Object {},
          "id": Any<String>,
          "motivation": Array [
            "contentState",
          ],
          "target": Array [
            Object {
              "selector": null,
              "selectors": Array [],
              "source": Object {
                "id": "https://example.org/canvas-1",
                "partOf": Array [
                  Object {
                    "id": "https://example.org/manifest-1",
                    "type": "Manifest",
                  },
                ],
                "type": "Canvas",
              },
              "type": "SpecificResource",
            },
          ],
          "type": "Annotation",
        }
      `
      );
    });

    test('2.2.1 Full annotation', () => {
      expect(
        normaliseContentState({
          '@context': 'http://iiif.io/api/presentation/3/context.json',
          id: 'https://example.org/Annotation-server/bookmarks/b1',
          type: 'Annotation',
          motivation: ['contentState'],
          target: {
            id: 'https://example.org/iiif/item1/manifest',
            type: 'Manifest',
          },
        } as any)
      ).toMatchInlineSnapshot(`
        Object {
          "extensions": Object {},
          "id": "https://example.org/Annotation-server/bookmarks/b1",
          "motivation": Array [
            "contentState",
          ],
          "target": Array [
            Object {
              "selector": null,
              "selectors": Array [],
              "source": Object {
                "id": "https://example.org/iiif/item1/manifest",
                "type": "Manifest",
              },
              "type": "SpecificResource",
            },
          ],
          "type": "Annotation",
        }
      `);
    });

    test('2.2.5 Limitations', () => {
      expect(
        normaliseContentState({
          '@context': 'http://iiif.io/api/presentation/3/context.json',
          id: 'https://example.org/import/1',
          type: 'Annotation',
          motivation: ['contentState'],
          target: {
            id: 'https://example.org/object1/canvas7#xywh=1000,2000,1000,2000',
            type: 'Canvas',
            partOf: [
              {
                id: 'https://example.org/object1/manifest',
                type: 'Manifest',
              },
            ],
          },
        } as any)
      ).toMatchInlineSnapshot(`
        Object {
          "extensions": Object {},
          "id": "https://example.org/import/1",
          "motivation": Array [
            "contentState",
          ],
          "target": Array [
            Object {
              "selector": Object {
                "height": 2000,
                "type": "BoxSelector",
                "unit": "pixel",
                "width": 1000,
                "x": 1000,
                "y": 2000,
              },
              "selectors": Array [
                Object {
                  "height": 2000,
                  "type": "BoxSelector",
                  "unit": "pixel",
                  "width": 1000,
                  "x": 1000,
                  "y": 2000,
                },
              ],
              "source": Object {
                "id": "https://example.org/object1/canvas7",
                "partOf": Array [
                  Object {
                    "id": "https://example.org/object1/manifest",
                    "type": "Manifest",
                  },
                ],
                "type": "Canvas",
              },
              "type": "SpecificResource",
            },
          ],
          "type": "Annotation",
        }
      `);
    });

    test('2.2.5.1 Reduced', () => {
      expect(
        normaliseContentState({
          id: 'https://example.org/object1/canvas7#xywh=1000,2000,1000,2000',
          type: 'Canvas',
          partOf: [
            {
              id: 'https://example.org/object1/manifest',
              type: 'Manifest',
            },
          ],
        })
      ).toMatchInlineSnapshot(
        { id: expect.any(String) },
        `
        Object {
          "extensions": Object {},
          "id": Any<String>,
          "motivation": Array [
            "contentState",
          ],
          "target": Array [
            Object {
              "selector": Object {
                "height": 2000,
                "type": "BoxSelector",
                "unit": "pixel",
                "width": 1000,
                "x": 1000,
                "y": 2000,
              },
              "selectors": Array [
                Object {
                  "height": 2000,
                  "type": "BoxSelector",
                  "unit": "pixel",
                  "width": 1000,
                  "x": 1000,
                  "y": 2000,
                },
              ],
              "source": Object {
                "id": "https://example.org/object1/canvas7",
                "partOf": Array [
                  Object {
                    "id": "https://example.org/object1/manifest",
                    "type": "Manifest",
                  },
                ],
                "type": "Canvas",
              },
              "type": "SpecificResource",
            },
          ],
          "type": "Annotation",
        }
      `
      );
    });

    test('3.1 linking', () => {
      expect(
        normaliseContentState({
          '@context': 'http://iiif.io/api/presentation/3/context.json',
          id: 'https://example.org/content-states/1',
          type: 'Annotation',
          motivation: ['contentState'],
          target: {
            id: 'http://dams.llgc.org.uk/iiif/2.0/4389767/canvas/4389772.json',
            type: 'Canvas',
            partOf: [
              {
                id: 'http://dams.llgc.org.uk/iiif/2.0/4389767/manifest.json',
                type: 'Manifest',
              },
            ],
          },
        } as any)
      ).toMatchInlineSnapshot(`
        Object {
          "extensions": Object {},
          "id": "https://example.org/content-states/1",
          "motivation": Array [
            "contentState",
          ],
          "target": Array [
            Object {
              "selector": null,
              "selectors": Array [],
              "source": Object {
                "id": "http://dams.llgc.org.uk/iiif/2.0/4389767/canvas/4389772.json",
                "partOf": Array [
                  Object {
                    "id": "http://dams.llgc.org.uk/iiif/2.0/4389767/manifest.json",
                    "type": "Manifest",
                  },
                ],
                "type": "Canvas",
              },
              "type": "SpecificResource",
            },
          ],
          "type": "Annotation",
        }
      `);
    });

    test('5.1 A region of a Canvas in a Manifest', () => {
      expect(
        normaliseContentState({
          '@context': 'http://iiif.io/api/presentation/3/context.json',
          id: 'https://example.org/import/1',
          type: 'Annotation',
          motivation: ['contentState'],
          target: {
            id: 'https://example.org/object1/canvas7#xywh=1000,2000,1000,2000',
            type: 'Canvas',
            partOf: [
              {
                id: 'https://example.org/object1/manifest',
                type: 'Manifest',
              },
            ],
          },
        } as any)
      ).toMatchInlineSnapshot(`
        Object {
          "extensions": Object {},
          "id": "https://example.org/import/1",
          "motivation": Array [
            "contentState",
          ],
          "target": Array [
            Object {
              "selector": Object {
                "height": 2000,
                "type": "BoxSelector",
                "unit": "pixel",
                "width": 1000,
                "x": 1000,
                "y": 2000,
              },
              "selectors": Array [
                Object {
                  "height": 2000,
                  "type": "BoxSelector",
                  "unit": "pixel",
                  "width": 1000,
                  "x": 1000,
                  "y": 2000,
                },
              ],
              "source": Object {
                "id": "https://example.org/object1/canvas7",
                "partOf": Array [
                  Object {
                    "id": "https://example.org/object1/manifest",
                    "type": "Manifest",
                  },
                ],
                "type": "Canvas",
              },
              "type": "SpecificResource",
            },
          ],
          "type": "Annotation",
        }
      `);
    });

    test('5.2. Start Playing at a Point in a Recording', () => {
      expect(
        normaliseContentState({
          '@context': 'http://iiif.io/api/presentation/3/context.json',
          id: 'https://example.org/import/2',
          type: 'Annotation',
          motivation: ['contentState'],
          target: {
            type: 'SpecificResource',
            source: {
              id: 'https://example.org/iiif/id1/canvas1',
              type: 'Canvas',
              partOf: [
                {
                  id: 'https://example.org/iiif/id1/manifest',
                  type: 'Manifest',
                },
              ],
            },

            selector: {
              type: 'PointSelector',
              t: 14.5,
            },
          },
        } as any)
      ).toMatchInlineSnapshot(`
        Object {
          "extensions": Object {},
          "id": "https://example.org/import/2",
          "motivation": Array [
            "contentState",
          ],
          "target": Array [
            Object {
              "selector": Object {
                "startTime": 14.5,
                "type": "TemporalSelector",
              },
              "selectors": Array [
                Object {
                  "startTime": 14.5,
                  "type": "TemporalSelector",
                },
              ],
              "source": Object {
                "id": "https://example.org/iiif/id1/canvas1",
                "partOf": Array [
                  Object {
                    "id": "https://example.org/iiif/id1/manifest",
                    "type": "Manifest",
                  },
                ],
                "type": "Canvas",
              },
              "type": "SpecificResource",
            },
          ],
          "type": "Annotation",
        }
      `);
    });

    test('5.3 multiple targets', () => {
      expect(
        normaliseContentState({
          '@context': 'http://iiif.io/api/presentation/3/context.json',
          id: 'https://example.org/import/3',
          type: 'Annotation',
          motivation: 'contentState',
          target: [
            {
              id: 'https://example.org/iiif/item1/canvas37',
              type: 'Canvas',
              partOf: [
                {
                  id: 'https://example.org/iiif/item1/manifest',
                  type: 'Manifest',
                },
              ],
            },

            {
              id: 'https://example.org/iiif/item2/canvas99',
              type: 'Canvas',
              partOf: [
                {
                  id: 'https://example.org/iiif/item2/manifest',
                  type: 'Manifest',
                },
              ],
            },
          ],
        } as any)
      ).toMatchInlineSnapshot(`
        Object {
          "extensions": Object {},
          "id": "https://example.org/import/3",
          "motivation": Array [
            "contentState",
          ],
          "target": Array [
            Object {
              "selector": null,
              "selectors": Array [],
              "source": Object {
                "id": "https://example.org/iiif/item1/canvas37",
                "partOf": Array [
                  Object {
                    "id": "https://example.org/iiif/item1/manifest",
                    "type": "Manifest",
                  },
                ],
                "type": "Canvas",
              },
              "type": "SpecificResource",
            },
            Object {
              "selector": null,
              "selectors": Array [],
              "source": Object {
                "id": "https://example.org/iiif/item2/canvas99",
                "partOf": Array [
                  Object {
                    "id": "https://example.org/iiif/item2/manifest",
                    "type": "Manifest",
                  },
                ],
                "type": "Canvas",
              },
              "type": "SpecificResource",
            },
          ],
          "type": "Annotation",
        }
      `);
    });
  });
});
