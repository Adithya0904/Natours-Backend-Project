class ApiFeatures{
    constructor(query,queryString){
        this.query=query
        this.queryString=queryString
    }

    filter() {
        let queryObject = { ...this.queryString };
        const excludeKeys = ['page', 'sort', 'limit', 'fields'];
        excludeKeys.forEach(ele => delete queryObject[ele]);

        // Log the original query object
        console.log('Original query object:', queryObject);

        // Stringify and replace operators (gte, gt, lt, lte)
        let queryStr = JSON.stringify(queryObject);
        console.log('Stringified query before operator replacement:', queryStr);

        // Replace the query operators with MongoDB-style operators
        queryStr = queryStr.replace(/\b(gte|gt|lt|lte)\b/g, match => `$${match}`);
        console.log('Stringified query after operator replacement:', queryStr);

        // Parse the stringified query back to JSON format
        queryObject = JSON.parse(queryStr);
        console.log('Final query object:', queryObject);

        // Return the filtered query (assuming 'find' is an async operation like Mongoose's .find())
        this.query=this.query.find(queryObject);

        return this
    }
    sort(){
        if(this.queryString.sort){
            console.log(this.queryString.sort)
            let querySort=this.queryString.sort.split(',').join(' ')
            console.log(querySort)
            this.query=this.query.sort(querySort)
        }

        return this
    }
    limitFields(){
        if(this.queryString.fields){
            const fields=this.queryString.fields.split(',').join(" ")
            this.query=this.query.select(fields)
        }else{
            //THIS QUERY HERE EXCLUDES THE OBJECT __v
            this.query=this.query.select('-__v')
        }

        return this
    }
    pagination(){
        const page=this.queryString.page*1||1
        console.log(page)
        const limit=this.queryString.limit*1||100
        console.log(limit)
        const skip=(page-1)*limit
        console.log(skip)

        //if page=3 and limit=10, then skip=20 documents to move to page 3
        this.query=this.query.skip(skip).limit(limit)

        return this
    }
}

module.exports=ApiFeatures