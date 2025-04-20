const fs=require('fs')
const express=require('express')

//Express here is a function which upon calling will add a bunch of methods to the const app variable.
const app=express()
app.use(express.json())

    /*      BASICS!!
        app.get('/',(req,res)=>{
        res
        .status(200)
        .json({
            message:'Hello from the server side!!', 
            app: 'Natours'
        })
        })

        app.post('/',(req,res)=>{
            res.send("You can post to this url")
        })
    */

const tours=JSON.parse(fs.readFileSync('./dev-data/data/tours-simple.json'))

//GET REQUEST
app.get('/api/v1/tours',(req,res)=>{
    res.status(200).json({
        status:'success',
        result:tours.length,
        data:{
            tours
        }
    })
})

//RESPONDING TO URL PARAMETER
//:id defining parameter and :x? defines optional parameter
app.get('/api/v1/tours/:id/:x?',(req,res)=>{
    console.log(req.params)

    //convet string to integer
    const id=req.params.id*1

//If the id not found or invalid (SOLUTION-1)
    // if (id>tours.length){
    //     return res.status(404).json({
    //         status:"failed",
    //         message:"Invalid ID"
    //     })
    // }

    //Using find method to find the element of id requested by user
    const tour=tours.find(ele=>ele.id === id)

//If the id not found or invalid (SOLUTION-2)
    if (!tour){
        return res.status(404).json({
            status:"failed",
            message:"Invalid ID"
        })
    }

    res.status(200).json({
        status:'success',
        result:tours.length,
        data:{
            tour
        }
    })
})

//POST METHOD
app.post('/api/v1/tours',(req,res)=>{
    // console.log(req.body)
    const newid=tours[tours.length-1].id+1
    const newTour=Object.assign({id:newid},req.body)

    tours.push(newTour)

    fs.writeFile('./dev-data/data/tours-simple.json',JSON.stringify(tours),err=>{
        res.status(201).json({
            status:'success',
            data:{
                tour:newTour
            }
        })
    })
})

//PATCH METHOD (UPDATING THE DATA)
app.patch('/api/v1/tours/:id',(req,res)=>{
    const id=req.params.id*1
    const tour=tours.find(ele=>ele.id === id)
    if (!tour){
        return res.status(404).json({
            status:"failed",
            message:"Invalid ID"
        })
    }
    res.status(200).json({
        status:"success",
        data:{
            tours:"<UPDATED DATA>"
        }
    })
})

//DELETE METHOD
app.delete('/api/v1/tours/:id',(req,res)=>{
    const id=req.params.id*1
    const tour=tours.find(ele=>ele.id === id)
    if (!tour){
        return res.status(404).json({
            status:"failed",
            message:"Invalid ID"
        })
    }
    res.status(204).json({
        status:"success",
        data:null
    })
})


const port=3000
app.listen(port,()=>{
    console.log(`App running on port ${port}.....`)
})
