// Deterministic network response for demos that use the real Wunder manifest.
export const wunderUrl = "https://digirati-co-uk.github.io/wunder.json";
export const wunderFixture = {
  id: wunderUrl,
  type: "Manifest",
  items: [2, 3].map((number) => {
    const id = `https://digirati-co-uk.github.io/wunder/canvases/${number}`;
    return {
      id,
      type: "Canvas",
      width: 960,
      height: 640,
      items: [
        {
          id: id + "/page",
          type: "AnnotationPage",
          items: [
            {
              id: id + "/painting",
              type: "Annotation",
              motivation: "painting",
              target: id,
              body: {
                id:
                  "data:image/svg+xml," +
                  encodeURIComponent(
                    `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="640"><rect width="960" height="640" fill="${number === 2 ? "#2463a7" : "orange"}"/></svg>`,
                  ),
                type: "Image",
                width: 960,
                height: 640,
              },
            },
          ],
        },
      ],
    };
  }),
};
