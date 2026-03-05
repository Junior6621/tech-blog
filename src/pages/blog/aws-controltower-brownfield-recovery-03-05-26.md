---
title: 'AWS Control Tower: How I Fixed my Brownfield Update Nightmare'
date: '2026-03-05'
description: 'Real-world fixes for AWS Control Tower update failures including Config Max Delivery Channel and CloudFormation name collisions.'
tags: ['AWS', 'Control Tower', 'CloudOps', 'Troubleshooting']
---

# AWS Control Tower: How I Fixed my Brownfield Update Nightmare

I thought the 2026 Landing Zone update would be a 10-minute task. Two hours and 11 error emails later, I realized I was wrong. If you are dealing with a Brownfield environment -- one with years of legacy stacks, manual Config tweaks, and orphaned roles -- the Control Tower automation is going to trip over almost everything.

I just spent the day digging through CloudFormation logs and CLI outputs to get an environment with 27+ customer accounts back to Green. Here are the three non-obvious blockers that will kill your update and exactly how I killed them first.

## 1. The Config One-Slot Rule
**The Error:** MaxNumberOfDeliveryChannelsExceededException

AWS Config has a hard limit: one delivery channel per region. If you have a leftover channel from a 2024 deployment or a manual setup named default, the Control Tower 2026-standard installer will fail.

**The Gotcha:** You cannot just delete the channel. AWS will not let you drop the exhaust pipe while the engine (the Recorder) is running.

**The Fix:** You have to stop the heart before you move the body. Run this in your Security/Audit account for both your home and governed regions:

```bash
# 1. Shutdown the engine
aws configservice stop-configuration-recorder --configuration-recorder-name <NAME> --region <REGION>
aws configservice delete-configuration-recorder --configuration-recorder-name <NAME> --region <REGION>

# 2. Now the pipe can be removed
aws configservice delete-delivery-channel --delivery-channel-name <NAME> --region <REGION>
```

## 2. Exorcising the Ghost Stacks
**The Error:** ResourceStatusReason: aws-controltower-NotificationForwarder already exists

This is a classic name collision. Somewhere in your Log Archive or Security account, there is an old StackSet from a year or two ago (look for BASELINE-CLOUDWATCH) that is still owning the names of your Lambda functions.

**The Fix:** Do not try to rename things. Just find the orphaned stack ID in the error message and delete the whole stack in the member account:

```bash
aws cloudformation delete-stack --stack-name <OLD_STACK_NAME> --region <REGION>
```

## 3. The IAM Path Trap
**The Error:** Control Tower no longer has access to [Role Name]

Control Tower is incredibly picky about IAM paths. If your CloudTrail or Admin roles are sitting in the root path, the automation will fail.

**The Fix:** These roles must be in the /service-role/ path. If yours are not, delete the orphan, recreate it with the correct trust relationship (cloudtrail.amazonaws.com), and make sure that path is set.

---

### The Final Inspection Checklist
* **Zero Config Policy:** Run `aws configservice describe-delivery-channels`. If it is not empty, the retry will fail.
* **Exorcise the Regions:** Errors in us-east-1 often have a twin in us-east-2. Clear both.
* **Isolate Customers:** Fix the Core first. Leave Customer OUs in Update Available until the foundation is solid.

Once I cleared these, the dashboard flipped to a solid Green. Now, on to the individual OU registrations.
