
  

# Awen technical exercise

  

[`🔗 Live application`](https://nextjs.org/docs/basic-features/font-optimization)
[`🔗 Demo of the exercise functionality`](https://www.loom.com/share/d90eea45cf8644639464dba3fc2841d8?sid=d4441699-04a9-4394-8c26-5e242b907582)

## To run locally

  

1. Install node version specified in package.json, if using nvm you can just run `nvm use`.

2. Install dependencies `npm i`

3. Add required environmental variables specified in `check.ts`

4. Run the development server `npm run dev`

  

## What I have implemented?

  

The application has the following features:

 - Text to image generation. Only style and dimensions are customizable in this example
 - Image to image generation. Possibility to update an image or select one of the generated ones.
 - Image preview with the ability to download or use as input image.
 -  Album with generated images (actions to download, delete or add as input)

## Further improvements needed
### Functionality and UX
 - Add more customization to generations (Add custom style, configure similarity with input image...). Also, tweak parameters to get better results.
 - Generated images are served from Replicate delivery URL. They are not available after a while. It would be needed to upload them to other storage location.
 - When selecting an existing generated image to generate a new image from, alert the user of the action and navigate to the image generation with the Img2Img Tab active.
 - Add a way to select input image from the generated ones directly in the form. 
 - Show specific errors depending on why the generation has not been successful.

### Codebase
-  Substitute console.log by logging library and register production logs in a service.
- Use a design system in a more systematic way. To make sure colours, spacing and sizes are consistent across the application. 
- Handle and log errors in a more structured way. Add error boundaries and fallback error pages in Frontend.
- EXTRA: Add some integration tests and integrate in CI
