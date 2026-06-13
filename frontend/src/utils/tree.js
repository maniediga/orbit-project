export const TREE_NODE_TYPES = Object.freeze({
    projectNode: "projectNode",
    categoryNode: "categoryNode",
    featureNode: "featureNode",
});

export const TREE_NODE_EXPANSION_STATES = Object.freeze({
    expanded: "expanded",
    folded: "folded",
});

export class TreeNode {
    constructor(uuid, name, parentNode, upperLayerParNode, treeNodeExpansionState, treeNodeStatus, treeNodeType, color) {
        this.uuid = uuid;
        this.name = name;
        this.parentNode = parentNode;
        this.upperLayerParNode = upperLayerParNode;
        this.expansionState = treeNodeExpansionState;
        this.status = treeNodeStatus;
        this.type = treeNodeType;
        this.color = color || "bg-white";
        this.children = [];
    }
}

export const TREE_NODE_BACKGROUND_COLORS = Object.freeze({
    blue: "bg-blue-700",
    red: "bg-red-700",
    white: "bg-white",
    green: "bg-green-700",
    yellow: "bg-yellow-500",
    pink: "bg-pink-700",
    purple: "bg-purple-700",
});

export const TREE_NODE_TEXT_COLORS = Object.freeze({
    blue: "text-blue-700",
    red: "text-red-700",
    white: "text-white",
    green: "text-green-700",
    yellow: "text-yellow-500",
    pink: "text-pink-700",
    purple: "text-purple-700",
});

export function convertToTree(projectData, filter, userId) {
    if (!projectData) return null;

    // map to access nodes by id
    const map = new Map();
    let projectExpansionStateString = localStorage.getItem(`project-${projectData.uuid}-expansionState`);

    // For shared projects the new user won't have the state saved locally on their machines.
    if (!projectExpansionStateString) {
        const tempProjectExpansionStateJson = {};
        for (const category of projectData.categories) {
            tempProjectExpansionStateJson[category.uuid] = {};
            tempProjectExpansionStateJson[category.uuid].expansionState = TREE_NODE_EXPANSION_STATES.folded;
            for (const feature of category.features) {
                tempProjectExpansionStateJson[category.uuid].features = {};
                tempProjectExpansionStateJson[category.uuid].features[feature.uuid] = TREE_NODE_EXPANSION_STATES.folded;
            }
        }
        const tempProjectExpansionStateString = JSON.stringify(tempProjectExpansionStateJson);
        localStorage.setItem(`project-${projectData.uuid}-expansionState`, tempProjectExpansionStateString);
        projectExpansionStateString = tempProjectExpansionStateString;
    }
    const projectExpansionStateJson = JSON.parse(projectExpansionStateString);
    // root node
    const projectNode = {
        uuid: projectData.uuid,
        name: projectData.name,
        roles: projectData.projectRoles,
        description: projectData.description,
        users: projectData.users,
        parentNode: projectData.parentNode,
        upperLayerParNode: projectData.upperLayerParNode,
        type: TREE_NODE_TYPES.projectNode,
        color: projectData.color || "bg-white",
        children: [],
    };
    map.set(projectData.uuid, projectNode);

    // create node and map them for each category of the project and each feature of a category.
    for (const category of projectData.categories) {
        const categoryNode = new TreeNode(
            category.uuid,
            category.name,
            category.parentUuid,
            projectData.uuid,
            projectExpansionStateJson[category.uuid].expansionState || TREE_NODE_EXPANSION_STATES.expanded,
            "category",
            TREE_NODE_TYPES.categoryNode,
            category.color,
        );
        map.set(category.uuid, categoryNode);

        // create feature nodes of the created category and map them
        for (const feature of category.features) {
            if (
                (filter === "assigned-to-me" && feature.details.assigneeId === userId) ||
                filter === "noFilter" ||
                feature.details.status === filter
            ) {
                const featureNode = new TreeNode(
                    feature.uuid,
                    feature.name,
                    feature.parentUuid,
                    category.uuid,
                    projectExpansionStateJson[category.uuid].features[feature.uuid] || TREE_NODE_EXPANSION_STATES.expanded,
                    feature.details.status,
                    TREE_NODE_TYPES.featureNode,
                    category.color,
                );
                map.set(feature.uuid, featureNode);
            }
        }
    }

    // connect all nodes to their respective parent nodes
    for (const category of projectData.categories) {
        const categoryNode = map.get(category.uuid);

        // if not parentUuid for category then its a top level category, therefore the child of the projectNode
        if (category.parentUuid === null) projectNode.children.push(categoryNode);
        // get categories parent node and push the current node to its children array
        else {
            map.get(category.parentUuid).children.push(categoryNode);
        }

        // connect all features of the current category to their parent feature/category
        for (const feature of category.features) {
            if (
                (filter === "assigned-to-me" && feature.details.assigneeId === userId) ||
                filter === "noFilter" ||
                feature.details.status === filter
            ) {
                const featureNode = map.get(feature.uuid);
                // no parentUuid , current category is the parent
                if (feature.parentUuid === null) categoryNode.children.push(featureNode);
                else if (map.get(feature.parentUuid)) {
                    map.get(feature.parentUuid).children.push(featureNode);
                }
            }
        }
    }

    if (filter !== "noFilter") {
        pruneEmptyNodes(projectNode);
    }

    return { projectNode, map };
}

function pruneEmptyNodes(node) {
    // Recursively filter children first (bottom-up approach)
    if (node.children && node.children.length > 0) {
        node.children = node.children.filter((child) => pruneEmptyNodes(child));
    }

    // Always keep the Project Node
    if (node.type === TREE_NODE_TYPES.projectNode) return true;

    // Always keep Feature Nodes (because they already passed the status filter in the loop above)
    if (node.type === TREE_NODE_TYPES.featureNode) return true;

    // Only keep Category Nodes if they still have children after the recursive filter
    if (node.type === TREE_NODE_TYPES.categoryNode) {
        return node.children.length > 0;
    }

    return false;
}
