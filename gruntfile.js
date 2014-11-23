module.exports = function(grunt) {
    var banner = '/*\n<%= pkg.name %> <%= pkg.version %>';
    //banner += '- <%= pkg.description %>\n<%= pkg.repository.url %>\n';
    //banner += 'Built on <%= grunt.template.today("yyyy-mm-dd") %>\n*/\n';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        jshint: {
            files: ['gruntfile.js', 'src/*.js'],
            options: {
                maxlen: 80,
                quotmark: 'single'
            }
        },
        simplemocha: {
            options: {
                globals: ['expect'],
                timeout: 3000,
                ignoreLeaks: false,
                ui: 'bdd',
                reporter: 'spec'
            },
            all: {
                src: ['test/*.js']
            }
        },
        component_root: './lib/components',
        templates_root: './lib/viewers/templates'
    });

    // grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-simple-mocha');

    grunt.registerTask('default', ['jshint', 'simplemocha']);
    grunt.registerTask('test', ['simplemocha']);


    grunt.registerTask('page', 'Generate page given an xml specification', function(input){
        var fs = require('fs')
        var ejs = require('ejs')
        var path = require('path')

        var xmlstring = fs.readFileSync(input,'utf8');
        
        var maker = require('./src/maker')
        var csg = maker.make(xmlstring);

        var stlstring = csg.toStlString();

        var template = fs.readFileSync('views/one.ejs','utf8');

        var basename = path.basename(input,'.xml')
        
        var viewerHtml = ejs.render(template, {stlstring: stlstring, xmlstring: xmlstring});
        var viewerFile = 'html/page_' + basename + '.html';

        fs.writeFileSync(viewerFile, viewerHtml);

        grunt.log.writeln("viewer is saved as [" + viewerFile + "]");        
    });

    grunt.registerTask('component', 'Generate examples and a THREE.js viewer for a component.', function(arg1) {
        if (arguments.length === 0) {
            grunt.log.writeln("please specify a component name");
            return;
        } else {
            grunt.log.writeln("generating examples for component [" + arg1 + "] ...");
        }

        var ejs = require('ejs')
        var fs = require('fs')


        var componentName = arg1;
        var componentPath = grunt.config.get('component_root') + '/' + componentName;
        var c = require(componentPath);

        var templateFile = grunt.config.get('templates_root') + '/' + 'three.ejs';
        var template = fs.readFileSync(templateFile,'utf8');
        // console.log(template)

        var renderedExamples = [];

        var examples = c.examples;
        var info = c.info;

        examples.forEach(function(example, i) {

            var example_id = componentName + i;

            var csg = c.generate(example.parameters);            
            example.stl = csg.toStlString();

            grunt.log.writeln("example " + i + " generated");

        });

        var viewerHtml = ejs.render(template, {examples: examples, component: info});
        var viewerFile = 'build/' + 'component_' + componentName + '.html';

        fs.writeFileSync(viewerFile, viewerHtml);

        grunt.log.writeln("viewer is saved as [" + viewerFile + "]");        

    });
};