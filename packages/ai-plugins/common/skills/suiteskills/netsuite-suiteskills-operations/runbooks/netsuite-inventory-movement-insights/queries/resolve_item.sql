SELECT id, itemid, displayname
FROM item
WHERE itemid = ':name'
   OR displayname = ':name'
ORDER BY id
