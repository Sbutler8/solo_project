const express = require('express')
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { Project, AddedFunctionality, Category, CategoriesAndProject } = require('../../db/models');
const { singleMulterUpload, singlePublicFileUpload } = require('../../awsS3');

router.get('/', asyncHandler(async function(_req, res) {
    const projects = await Project.findAll();
    res.json({ projects });
  }));


  router.get('/:id', asyncHandler(async function(req, res) {
    const project = await Project.findByPk(Number(req.params.id));
    const category = await Category.findOne({
      through: {
        model: CategoriesAndProject,
        where: { projectId: req.params.id }
      },
    });

    const addedFunctions = await AddedFunctionality.findAll({
      where: {
        projectId: req.params.id,
      }
    })
    res.json({ project, addedFunctions, category });
}));

router.post('/', singleMulterUpload("image"), asyncHandler(async function (req, res) {
  const addedFeatureImageUrl = await singlePublicFileUpload(req.file);
  const addedFeature = await AddedFunctionality.create( {name: req.body.name, code: req.body.code, vidPic: addedFeatureImageUrl, projectId: req.body.projectId } );
  res.json(addedFeature);
  })
);

router.get('/all/:categoryId', asyncHandler(async function(req, res) {

  const categoryId = req.params.categoryId;

  const categoriesAndProjects = await Project.findAll({
    include: {
      model: Category,
      where: {id:req.params.categoryId}
    }
  });
  res.json( { categoriesAndProjects });
}));

module.exports = router;
