import Organization from "../model/organization.model.js";
import User from "../model/user.model.js";

const CreateOrganization = async (req, res) => {
  const { orgName, description } = req.body;

  const userId = req.user.id;

  const isOrgExist = await Organization.findOne({
    organization: orgName,
  });

  if (isOrgExist)
    return res.status(400).send("organisasi sudah pernah terdaftar.");

  const newOrg = new Organization({
    organization: orgName,
    description,
    admin: userId,
    members: [userId],
  });

  newOrg
    .save()
    .then(async (result) => {
      await User.findByIdAndUpdate(userId, {
        $addToSet: { organization: result.id },
      })
        .then((ress) => {})
        .catch((err) =>
          res.status(500).json({
            status: "error",
            msg: err,
          })
        );
      return res.status(200).json({
        status: "success",
        result,
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: "error",
        msg: err,
      });
    });
};

const GetOrg = async (req, res) => {
  const getAll = await Organization.find({});
  return res.send(getAll);
};

const OrgDetail = async (req, res) => {
  const { orgId } = req.params;

  await Organization.findById(orgId)
    .select("_id organization admin voteEvents members description")
    .populate("admin voteEvents members", "name email voteTitle")
    .then((result) => {
      return res.status(200).json(result);
    })
    .catch(() => res.status(404).send("user tidak ditemukan"));
};

const AddMember = async (req, res) => {
  const { id } = req.body;
  const { orgId } = req.params;

  await Organization.findByIdAndUpdate(
    orgId,
    { $addToSet: { members: id } },
    { new: true }
  )
    .then(async (result) => {
      await User.findByIdAndUpdate(id, {
        $addToSet: { organization: orgId },
      });
      return res.status(200).json({ status: "success", result });
    })
    .catch((err) => {
      return res.status(500).json({ status: "error", msg: err.message });
    });
};

export { CreateOrganization, OrgDetail, GetOrg, AddMember };
