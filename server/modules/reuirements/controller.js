import Requirement from './model';

export const getAllRequirements = async (req, res) => {
    try {
        return res.status(200).json({requirements: await Requirement.find()});
    }catch(e){
        return res.status(500).json({error:true, message:e.message})
    }
}

export const getNearbyRequirements = async (req, res) => {
    try {
        console.log(req.body.lng)
        let result = await Requirement.find({
            location: {
                $nearSphere: {
                    $geometry: {
                        type: "Point",
                        coordinates: [
                            parseFloat(req.body.lng),
                            parseFloat(req.body.lat)
                        ]
                    },
                    $maxDistance: 5000,
                }
            },
        });
        return res.status(201).json({ error: false, requirements: result })
    } catch (e) {
        return res.status(500).json({ error: true, message: e.message })
    }
}

export const updateRequirements = async (req, res,) => {
    try {
        
    } catch (error) {
        
    }
}